// app/api/teachers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

type Teacher = {
  id: string;
  name: string;
  [key: string]: unknown; // allow extra fields without using `any`
};

async function getTeachers(): Promise<Teacher[]> {
  const data = await kv.get(keys.teachers);
  return Array.isArray(data) ? (data as Teacher[]) : [];
}

export async function GET(_request: NextRequest) {
  const teachers = await getTeachers();
  return NextResponse.json(teachers);
}

export async function POST(request: NextRequest) {
  const teacher = (await request.json()) as Teacher;
  const teachers = await getTeachers();

  teachers.push(teacher);
  await kv.set(keys.teachers, teachers);

  return NextResponse.json(teacher, { status: 201 });
}
