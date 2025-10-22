// app/api/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

type Lesson = {
  id: string;
  date: string;
  teacherId: string;
  [key: string]: unknown;
};

async function getLessons(): Promise<Lesson[]> {
  const data = await kv.get(keys.lessons);
  return Array.isArray(data) ? (data as Lesson[]) : [];
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const teacherId = url.searchParams.get("teacherId");

  let arr = await getLessons();

  if (date) arr = arr.filter((l) => l.date === date);
  if (teacherId) arr = arr.filter((l) => l.teacherId === teacherId);

  return NextResponse.json(arr);
}

export async function POST(request: NextRequest) {
  const lesson = (await request.json()) as Lesson;
  const arr = await getLessons();

  arr.push(lesson);
  await kv.set(keys.lessons, arr);

  return NextResponse.json(lesson, { status: 201 });
}
