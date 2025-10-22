// app/api/timeSlots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv, keys } from "../_kv";

export async function GET(_request: NextRequest) {
  const data = await kv.get(keys.timeSlots);
  const timeSlots = Array.isArray(data) ? (data as string[]) : [];
  return NextResponse.json(timeSlots);
}

export async function PUT(request: NextRequest) {
  const slots = (await request.json()) as string[];
  await kv.set(keys.timeSlots, slots);
  return NextResponse.json(slots);
}
