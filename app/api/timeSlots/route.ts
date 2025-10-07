import { NextResponse } from "next/server";
import { kv, keys } from "../_kv";

export async function GET() {
  const data = (await kv.get(keys.timeSlots)) as string[] | null;
  return NextResponse.json(data ?? []);
}

export async function PUT(req: Request) {
  const slots = await req.json(); // string[]
  await kv.set(keys.timeSlots, slots);
  return NextResponse.json(slots);
}
