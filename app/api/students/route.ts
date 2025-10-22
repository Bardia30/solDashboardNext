// app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

type Student = {
  id: string;
  name: string;
  [key: string]: unknown; // allow extra fields safely
};

async function getStudents(): Promise<Student[]> {
  const data = await kv.get(keys.students);
  return Array.isArray(data) ? (data as Student[]) : [];
}

export async function GET(_request: NextRequest) {
  const students = await getStudents();
  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  const student = (await request.json()) as Student;
  const students = await getStudents();

  students.push(student);
  await kv.set(keys.students, students);

  return NextResponse.json(student, { status: 201 });
}
