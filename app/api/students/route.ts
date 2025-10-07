import { NextResponse } from "next/server";
import { kv, keys } from "../_kv";

export async function GET() {
  const data = (await kv.get(keys.students)) as any[] | null;
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const s = await req.json();
  const arr = ((await kv.get(keys.students)) as any[] | null) ?? [];
  arr.push(s);
  await kv.set(keys.students, arr);
  return NextResponse.json(s, { status: 201 });
}
