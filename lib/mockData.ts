// src/lib/mockData.ts
import teachersData from "./teachers.json";
import studentsData from "./students.json";
import type { Teacher, Student, Lesson } from "../types";

// ---------- Teachers ----------
export const teachers: Teacher[] = teachersData as Teacher[];

// ---------- Students (inject defaults if JSON is minimal) ----------
type RawStudent = Partial<Student> & Pick<Student, "id" | "name" | "hasPaid" | "makeupLessons">;

export const students: Student[] = (studentsData as RawStudent[]).map((s) => ({
  totalSessions: 8,          // default if missing
  currentSession: 1,         // default if missing
  ...s,
}));



function buildTimeSlots(start: string, end: string, stepMinutes = 30): string[] {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const startTotal = sH * 60 + sM;
  const endTotal = eH * 60 + eM;

  const out: string[] = [];
  for (let t = startTotal; t <= endTotal; t += stepMinutes) {
    const h24 = Math.floor(t / 60);
    const m = t % 60;
    const ampm = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    out.push(`${h12}:${m.toString().padStart(2, "0")} ${ampm}`);
  }
  return out;
}

export const timeSlots: string[] = buildTimeSlots("11:00", "20:30");

// ---------- Initial lessons ----------
// Bind to existing teacher/student IDs from JSON (fallbacks keep TS happy)
const todayISO = new Date().toISOString().split("T")[0];
const firstTeacherId = teachers[0]?.id ?? "t1";
const secondTeacherId = teachers[1]?.id ?? firstTeacherId;

const firstStudentId = students[0]?.id ?? "s1";
const secondStudentId = students[1]?.id ?? firstStudentId;

export const initialLessons: Lesson[] = [
  {
    id: "l1",
    studentId: firstStudentId,
    teacherId: firstTeacherId,
    date: todayISO,
    timeSlot: timeSlots[2], // 4:00 PM
    cancelled: false,
    isMakeup: false,
    sessionNumber: 1,
  },
  {
    id: "l2",
    studentId: secondStudentId,
    teacherId: secondTeacherId,
    date: todayISO,
    timeSlot: timeSlots[3], // 4:30 PM
    cancelled: false,
    isMakeup: false,
    sessionNumber: 2,
  },
];


