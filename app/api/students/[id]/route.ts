// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../../_kv";

type Student = {
  id: string;
  // keep it flexible without using `any`
  [key: string]: unknown;
};

async function getStudents(): Promise<Student[]> {
  const data = await kv.get(keys.students);
  return Array.isArray(data) ? (data as Student[]) : [];
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ← Next 15 expects a Promise here
) {
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<Student>;

  const arr = await getStudents();
  const idx = arr.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated: Student = { ...arr[idx], ...patch, id }; // keep id authoritative
  arr[idx] = updated;

  await kv.set(keys.students, arr);
  return NextResponse.json(updated);
}
