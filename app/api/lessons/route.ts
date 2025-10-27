// app/api/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

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

// ---------- GET with date range ----------
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");           // exact day
  const from = url.searchParams.get("from");           // inclusive
  const to = url.searchParams.get("to");               // inclusive
  const teacherId = url.searchParams.get("teacherId");

  let arr = await getLessons();

  if (teacherId) arr = arr.filter((l) => l.teacherId === teacherId);

  if (from && to) {
    arr = arr.filter((l) => l.date >= from && l.date <= to);
  } else if (date) {
    arr = arr.filter((l) => l.date === date);
  }

  return NextResponse.json(arr);
}

// ---------- POST that always repeats regular ----------
export async function POST(request: NextRequest) {
  const { lesson, repeatWeekly, weeks } = (await request.json()) as {
    lesson: Lesson;
    repeatWeekly?: boolean;
    weeks?: number;
  };

  if (!lesson?.teacherId || !lesson?.studentId || !lesson?.date || !lesson?.timeSlot) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const type: "regular" | "makeup" = (lesson.type ?? "regular") as any;
  const shouldRepeat =
    type === "regular" ? (repeatWeekly ?? true) : false; // ⬅️ force repeat for regular by default
  const totalWeeks = shouldRepeat ? Math.max(1, Math.min(weeks ?? 12, 52)) : 1;

  const seriesId = shouldRepeat ? `series_${lesson.id}` : undefined;

  const all = await getLessons();
  const created: Lesson[] = [];

  const startSession =
    typeof lesson.sessionNumber === "number" && lesson.sessionNumber > 0
      ? lesson.sessionNumber
      : 1;

  for (let w = 0; w < totalWeeks; w++) {
    const dateW = w === 0 ? lesson.date : addDays(lesson.date, 7 * w);

    const occ: Lesson = {
      ...lesson,
      id: w === 0 ? lesson.id : `${lesson.id}_${w}`,
      date: dateW,
      timeSlot: lesson.timeSlot,
      type,
      seriesId,
      sessionNumber: type === "regular" ? startSession + w : startSession,
    };

    // prevent duplicates
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

  await kv.set(keys.lessons, all);

  return NextResponse.json(
    { createdCount: created.length, created },
    { status: 201 }
  );
}
