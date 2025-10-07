import { NextResponse } from "next/server";
import { kv, keys } from "../../_kv";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json();
  const arr = ((await kv.get(keys.lessons)) as any[] | null) ?? [];
  const idx = arr.findIndex((l) => l.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  arr[idx] = { ...arr[idx], ...patch };
  await kv.set(keys.lessons, arr);
  return NextResponse.json(arr[idx]);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const arr = ((await kv.get(keys.lessons)) as any[] | null) ?? [];
  const idx = arr.findIndex((l) => l.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [removed] = arr.splice(idx, 1);
  await kv.set(keys.lessons, arr);
  return NextResponse.json(removed);
}
