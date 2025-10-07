import { NextResponse } from "next/server";
import { kv, keys } from "../_kv";

export async function GET() {
  const data = (await kv.get(keys.teachers)) as any[] | null;
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const t = await req.json();
  const arr = ((await kv.get(keys.teachers)) as any[] | null) ?? [];
  arr.push(t);
  await kv.set(keys.teachers, arr);
  return NextResponse.json(t, { status: 201 });
}
