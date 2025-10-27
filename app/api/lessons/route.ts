// app/api/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

// 🔥 disable caching on Vercel/edge
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Lesson = {
  id: string;
  teacherId: string;
  studentId: string;
  date: string;        // "YYYY-MM-DD"
  timeSlot: string;    // "HH:mm"
  sessionNumber?: number;
  type?: "regular" | "makeup";
  seriesId?: string;
};

type Student = {
  id: string;
  name?: string;
  currentSession?: number; // e.g., 1..N
  totalSessions?: number;  // package cap (optional)
  [k: string]: unknown;
};

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

async function getLessons(): Promise<Lesson[]> {
  const data = await kv.get(keys.lessons);
  return Array.isArray(data) ? (data as Lesson[]) : [];
}

// Optional helpers if you store students in KV
async function getStudents(): Promise<Student[]> {
  const data = await kv.get(keys.students);
  return Array.isArray(data) ? (data as Student[]) : [];
}
async function setStudents(students: Student[]) {
  await kv.set(keys.students, students);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");       // exact day you’re viewing
  const teacherId = url.searchParams.get("teacherId");

  let arr = await getLessons();
  if (date) arr = arr.filter((l) => l.date === date);
  if (teacherId) arr = arr.filter((l) => l.teacherId === teacherId);

  return NextResponse.json(arr);
}

export async function POST(request: NextRequest) {
  // Expecting: { lesson: { id, teacherId, studentId, date, timeSlot, ... }, repeatWeekly?: boolean, weeks?: number }
  const { lesson, repeatWeekly, weeks } = (await request.json()) as {
    lesson: Lesson;
    repeatWeekly?: boolean;
    weeks?: number;
  };

  if (!lesson?.teacherId || !lesson?.studentId || !lesson?.date || !lesson?.timeSlot) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const isRegular = (lesson.type ?? "regular") === "regular";
  const totalWeeks = repeatWeekly && isRegular ? Math.max(1, Math.min(weeks ?? 12, 52)) : 1; // safety cap
  const seriesId = repeatWeekly && isRegular ? `series_${lesson.id}` : undefined;

  const all = await getLessons();
  const created: Lesson[] = [];

  // --- (optional) pull student to know current/total for session math ---
  let students: Student[] | null = null;
  let student: Student | undefined;
  try {
    students = await getStudents();
    student = students.find((s) => s.id === lesson.studentId);
  } catch {
    // if there's no students key, we’ll just base off the incoming lesson.sessionNumber
  }

  const startSessionFromStudent =
    student?.currentSession && student.currentSession > 0 ? student.currentSession : undefined;

  // Prefer the incoming sessionNumber; fallback to student's currentSession; fallback to 1
  const startSession =
    typeof lesson.sessionNumber === "number" && lesson.sessionNumber > 0
      ? lesson.sessionNumber
      : (startSessionFromStudent ?? 1);

  for (let w = 0; w < totalWeeks; w++) {
    const dateW = w === 0 ? lesson.date : addDays(lesson.date, 7 * w);

    const occ: Lesson = {
      ...lesson,
      id: w === 0 ? lesson.id : `${lesson.id}_${w}`,
      date: dateW,
      timeSlot: lesson.timeSlot,
      seriesId,
      // 👇 increment sessionNumber ONLY for regular weekly series
      sessionNumber: isRegular ? (startSession + w) : (lesson.sessionNumber ?? startSession),
      type: lesson.type ?? "regular",
    };

    // Avoid duplicates if the admin repeats the action
    const exists = all.some(
      (L) =>
        L.teacherId === occ.teacherId &&
        L.studentId === occ.studentId &&
        L.date === occ.date &&
        L.timeSlot === occ.timeSlot
    );
    if (!exists) {
      all.push(occ);
      created.push(occ);
    }
  }

  // Persist the new lessons
  await kv.set(keys.lessons, all);

  // 🧮 Update student's currentSession when REGULAR lessons created
  if (isRegular && created.length > 0 && students && student) {
    const idx = students.findIndex((s) => s.id === student!.id);
    if (idx !== -1) {
      const current = Number(student.currentSession ?? 0);
      const total = Number(student.totalSessions ?? Infinity); // if no cap, use Infinity
      const newCount = Math.min(current + created.length, total);

      // Only update if it actually increases
      if (newCount !== current) {
        students[idx] = { ...student, currentSession: newCount };
        await setStudents(students);
      }
    }
  }

  return NextResponse.json(created, { status: 201 });
}
