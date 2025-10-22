// app/api/lessons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../../_kv";

type Lesson = {
  id: string;
  // allow other fields without using `any`
  [key: string]: unknown;
};

async function getLessons(): Promise<Lesson[]> {
  const data = await kv.get(keys.lessons);
  return Array.isArray(data) ? (data as Lesson[]) : [];
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> } // <- Vercel/Next 15 expects a Promise here
) {
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<Lesson>;

  const arr = await getLessons();
  const idx = arr.findIndex((l) => l.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated: Lesson = { ...arr[idx], ...patch, id }; // keep id authoritative
  arr[idx] = updated;
  await kv.set(keys.lessons, arr);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> } // <- Promise as well
) {
  const { id } = await ctx.params;

  const arr = await getLessons();
  const idx = arr.findIndex((l) => l.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [removed] = arr.splice(idx, 1);
  await kv.set(keys.lessons, arr);

  return NextResponse.json(removed);
}
