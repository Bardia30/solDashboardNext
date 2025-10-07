import { NextResponse } from "next/server";
import { kv, keys } from "../../_kv";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const patch = await req.json();
  const arr = ((await kv.get(keys.students)) as any[] | null) ?? [];
  const idx = arr.findIndex((s) => s.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  arr[idx] = { ...arr[idx], ...patch };
  await kv.set(keys.students, arr);
  return NextResponse.json(arr[idx]);
}
