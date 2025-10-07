import { NextResponse } from "next/server";
import { kv, keys } from "../_kv";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const teacherId = url.searchParams.get("teacherId");
  let arr = ((await kv.get(keys.lessons)) as any[] | null) ?? [];
  if (date) arr = arr.filter((l) => l.date === date);
  if (teacherId) arr = arr.filter((l) => l.teacherId === teacherId);
  return NextResponse.json(arr);
}

export async function POST(req: Request) {
  const lesson = await req.json();
  const arr = ((await kv.get(keys.lessons)) as any[] | null) ?? [];
  arr.push(lesson);
  await kv.set(keys.lessons, arr);
  return NextResponse.json(lesson, { status: 201 });
}
