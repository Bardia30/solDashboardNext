export interface Teacher {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  totalSessions: number; // 4 or 8
  currentSession: number; // which session they're on
  hasPaid: boolean;
  makeupLessons: number;
}

export interface Lesson {
  id: string;
  studentId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM format (24-hour)
  cancelled: boolean;
  isMakeup: boolean; // true if this is a makeup/one-time lesson (only for this week), false if regular/recurring
  sessionNumber: number; // which session number this is (e.g., 5 out of 8)
}

export interface TimeSlot {
  time: string;
  lesson: Lesson | null;
  student: Student | null;
}