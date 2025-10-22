// app/api/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

type Lesson = {
  id: string;
  teacherId: string;
  studentId: string;
  // date-only or ISO? Keep what you use now; assuming "YYYY-MM-DD"
  date: string;               // e.g. "2025-10-22"
  start: string;              // "HH:mm" (e.g. "16:30")
  end: string;                // "HH:mm"
  // optional recurrence metadata
  seriesId?: string;
};

type CreateLessonPayload = {
  lesson: Lesson;             // the first occurrence
  repeatWeekly?: boolean;     // mark "regular"
  weeks?: number;             // how many total weeks to create (default 12)
};

// ---- helpers ----
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const y2 = dt.getUTCFullYear();
  const m2 = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getUTCDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

function sameSlot(a: Lesson, b: Lesson) {
  return (
    a.teacherId === b.teacherId &&
    a.date === b.date &&
    a.start === b.start &&
    a.end === b.end
  );
}

async function getLessons(): Promise<Lesson[]> {
  const data = await kv.get(keys.lessons);
  return Array.isArray(data) ? (data as Lesson[]) : [];
}

export async function POST(request: NextRequest) {
  const { lesson, repeatWeekly, weeks }: CreateLessonPayload = await request.json();

  const totalWeeks = Math.max(1, Math.min(weeks ?? 12, 52)); // cap for sanity
  const seriesId = repeatWeekly ? `series_${lesson.id}` : undefined;

  const all = await getLessons();
  const created: Lesson[] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const nextDate = w === 0 ? lesson.date : addDays(lesson.date, 7 * w);
    const occ: Lesson = {
      ...lesson,
      id: w === 0 ? lesson.id : `${lesson.id}_${w}`, // unique id per occurrence
      date: nextDate,
      seriesId,
    };

    // Avoid duplicates if admin re-submits
    const exists = all.some((L) => sameSlot(L, occ));
    if (!exists) {
      all.push(occ);
      created.push(occ);
    }
  }

  await kv.set(keys.lessons, all);

  // Return all created occurrences (at least the first one)
  return NextResponse.json(created, { status: 201 });
}
