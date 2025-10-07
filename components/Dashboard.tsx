"use client";

import { useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useClerk } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Music, Settings, Users, Clock } from "lucide-react";

// types
import type { Teacher, Student, Lesson, TimeSlot as TimeSlotType } from "@/types";

// data (temporary until you wire APIs)
import {
  teachers as teacherData,
  students as studentData,
  initialLessons as lessonData,
  timeSlots as timeSlotData,
} from "@/lib/mockData";

// ✅ local persistence helpers
import { load, save } from "@/lib/storage";

// components
import { TimeSlotDropZone } from "@/components/TimeSlotDropZone";
import { StudentDialog } from "@/components/StudentDialog";
import { AddLessonDialog } from "@/components/AddLessonDialog";
import { ManageStudentsDialog } from "@/components/ManageStudentsDialog";
import { ManageTeachersDialog } from "@/components/ManageTeachersDialog";
import { ManageTimeSlotsDialog } from "@/components/ManageTimeSlotsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// role helper
import { useRole } from "@/lib/role";

type Props = {
  /** If true, this page is /admin (no slug in URL) */
  isAdminRoute?: boolean;
  /** If rendering on /:slug, pass slug in (lowercased) */
  routeSlug?: string;
};

export default function Dashboard({ isAdminRoute = false, routeSlug = "" }: Props) {
  const { isLoaded, isAdmin, userSlug } = useRole();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Loading…</h1>
          <p className="text-muted-foreground">Checking your permissions.</p>
        </div>
      </div>
    );
  }

  // auth guard
  const isTeacherRoute = !isAdminRoute && Boolean(routeSlug);
  const isAuthorized = (isTeacherRoute && routeSlug === userSlug) || (isAdminRoute && isAdmin);
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Unauthorized</h1>
          <p className="text-muted-foreground">You don’t have access to this page.</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               STATE + PERSIST                              */
  /* -------------------------------------------------------------------------- */

  // ✅ lazy-load from localStorage (fallback to mock data once)
  const [teachers, setTeachers] = useState<Teacher[]>(
    () => load("teachers", teacherData ?? [])
  );
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(
    () => (load<Teacher[]>("teachers", teacherData ?? [])[0] ?? teacherData?.[0] ?? null)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lessons, setLessons] = useState<Lesson[]>(
    () => load("lessons", lessonData ?? [])
  );
  const [students, setStudents] = useState<Student[]>(
    () => load("students", studentData ?? [])
  );
  const [timeSlots, setTimeSlots] = useState<string[]>(
    () => load("timeSlots", timeSlotData ?? [])
  );

  // ✅ autosave when state changes
  useEffect(() => { save("teachers", teachers); }, [teachers]);
  useEffect(() => { save("students", students); }, [students]);
  useEffect(() => { save("lessons", lessons); }, [lessons]);
  useEffect(() => { save("timeSlots", timeSlots); }, [timeSlots]);

  /* -------------------------------------------------------------------------- */

  const [editingStudent, setEditingStudent] = useState<{ student: Student; lesson: Lesson } | null>(null);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [manageStudentsOpen, setManageStudentsOpen] = useState(false);
  const [manageTeachersOpen, setManageTeachersOpen] = useState(false);
  const [manageTimeSlotsOpen, setManageTimeSlotsOpen] = useState(false);

  const canEdit = isAdmin;

  const visibleTeachers = useMemo(() => {
    if (isAdmin) return teachers;
    return teachers.filter((t) => t.name.toLowerCase() === routeSlug || t.name.toLowerCase() === userSlug);
  }, [isAdmin, teachers, routeSlug, userSlug]);

  useEffect(() => {
    if (visibleTeachers.length > 0) {
      setSelectedTeacher((prev) => {
        if (!prev) return visibleTeachers[0];
        const stillVisible = visibleTeachers.find((t) => t.id === prev.id);
        return stillVisible ?? visibleTeachers[0];
      });
    } else {
      setSelectedTeacher(null);
    }
  }, [visibleTeachers]);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const navigateDate = (days: number) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      return d;
    });
  };

  const getScheduleForDay = (): TimeSlotType[] => {
    const dateStr = formatDate(selectedDate);
    if (!selectedTeacher) {
      return timeSlots.map((time) => ({ time, lesson: null, student: null }));
    }
    return timeSlots.map((time) => {
      const lesson = lessons.find(
        (l) => l.teacherId === selectedTeacher.id && l.date === dateStr && l.timeSlot === time
      );
      const student = lesson ? students.find((s) => s.id === lesson.studentId) || null : null;
      return { time, lesson: lesson || null, student };
    });
  };

  // ---- Mutations (still local; later swap to API calls) ----
  const handleCancelLesson = (lessonId: string) => {
    if (!canEdit) return;
    setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, cancelled: !l.cancelled } : l)));
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!canEdit) return;
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const handleDropLesson = (lesson: Lesson, _student: Student, newTimeSlot: string) => {
    if (!canEdit) return;
    setLessons((prev) =>
      prev.map((l) => (l.id === lesson.id ? { ...l, timeSlot: newTimeSlot, date: formatDate(selectedDate) } : l))
    );
  };

  const handleEditStudent = (student: Student, lesson: Lesson) => {
    if (!canEdit) return;
    setEditingStudent({ student, lesson });
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    if (!canEdit) return;
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleAddLesson = (studentId: string, sessionNumber: number, isMakeup: boolean) => {
    if (!canEdit || !addingLesson || !selectedTeacher) return;
    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      studentId,
      teacherId: selectedTeacher.id,
      date: formatDate(selectedDate),
      timeSlot: addingLesson,
      cancelled: false,
      isMakeup,
      sessionNumber,
    };
    setLessons((prev) => [...prev, newLesson]);
  };

  const handleSaveLesson = (updatedLesson: Lesson) => {
    if (!canEdit) return;
    setLessons((prev) => prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)));
  };

  const handleSaveTeachers = (updatedTeachers: Teacher[]) => {
    if (!canEdit) return;
    setTeachers(updatedTeachers);
    setSelectedTeacher((prev) => {
      if (!prev) return updatedTeachers[0] ?? null;
      const stillExists = updatedTeachers.find((t) => t.id === prev.id);
      return stillExists ?? (updatedTeachers[0] ?? null);
    });
  };

  const schedule = getScheduleForDay();
  const lessonsToday = schedule.filter((slot) => slot.lesson && !slot.lesson.cancelled).length;
  const cancelledToday = schedule.filter((slot) => slot.lesson && slot.lesson.cancelled).length;

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Minimal debug badge */}
      <div className="fixed top-2 right-2 z-50 text-xs bg-black text-white rounded-lg px-3 py-2 opacity-80">
        {isAdmin ? "🟢 ADMIN MODE" : "🔵 TEACHER MODE"}
      </div>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h1>Music School Dashboard</h1>
                <p className="text-muted-foreground">
                  {isAdmin ? "Admin mode (full access)" : "Read-only"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setManageTimeSlotsOpen(true)} disabled={!isAdmin}>
                <Clock className="w-4 h-4 mr-2" />
                Time Slots
              </Button>
              <Button variant="outline" onClick={() => setManageStudentsOpen(true)} disabled={!isAdmin}>
                <Users className="w-4 h-4 mr-2" />
                Students
              </Button>
              <Button variant="outline" onClick={() => setManageTeachersOpen(true)} disabled={!isAdmin}>
                <Settings className="w-4 h-4 mr-2" />
                Teachers
              </Button>
              {/* Optional admin-only reset of local data */}
              
              <Button variant="destructive" onClick={() => signOut({ redirectUrl: "/" })}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Teacher</label>
                  <Select
                    value={selectedTeacher?.id ?? ""}
                    onValueChange={(value: string) => {
                      const t = teachers.find((tt) => tt.id === value);
                      if (t) setSelectedTeacher(t);
                    }}
                    disabled={!isAdmin || teachers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedTeacher ? selectedTeacher.name : "Select a teacher"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(isAdmin ? teachers : visibleTeachers).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Date</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center px-4 py-2 border border-border rounded-md bg-background">
                      {formatDisplayDate(selectedDate)}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-accent rounded-lg p-4">
                  <div className="text-2xl text-accent-foreground">{lessonsToday}</div>
                  <div className="text-sm text-muted-foreground">Active Lessons</div>
                </div>
                <div className="bg-accent rounded-lg p-4">
                  <div className="text-2xl text-accent-foreground">{cancelledToday}</div>
                  <div className="text-sm text-muted-foreground">Cancelled</div>
                </div>
                <div className="bg-accent rounded-lg p-4">
                  <div className="text-2xl text-accent-foreground">{students.filter((s) => !s.hasPaid).length}</div>
                  <div className="text-sm text-muted-foreground">Unpaid Students</div>
                </div>
                <div className="bg-accent rounded-lg p-4">
                  <div className="text-2xl text-accent-foreground">
                    {students.reduce((sum, s) => sum + s.makeupLessons, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Makeups</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedTeacher ? `Schedule for ${selectedTeacher.name}` : "Schedule"}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border border-border rounded-lg overflow-hidden">
                {getScheduleForDay().map((slot) => (
                  <TimeSlotDropZone
                    key={slot.time}
                    time={slot.time}
                    lesson={slot.lesson}
                    student={slot.student}
                    onDrop={isAdmin ? handleDropLesson : undefined}
                    onCancel={isAdmin ? handleCancelLesson : undefined}
                    onEdit={isAdmin ? handleEditStudent : undefined}
                    onAddLesson={isAdmin ? setAddingLesson : undefined}
                    onDeleteLesson={isAdmin ? handleDeleteLesson : undefined}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        {isAdmin && (
          <>
            <StudentDialog
              student={editingStudent?.student || null}
              lesson={editingStudent?.lesson || null}
              isOpen={!!editingStudent}
              onClose={() => setEditingStudent(null)}
              onSave={handleSaveStudent}
              onSaveLesson={handleSaveLesson}
            />
            <AddLessonDialog
              isOpen={!!addingLesson}
              onClose={() => setAddingLesson(null)}
              onAdd={handleAddLesson}
              students={students}
              timeSlot={addingLesson || ""}
              teacher={selectedTeacher as Teacher | null}
              date={(() => {
                const d = selectedDate;
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                  d.getDate()
                ).padStart(2, "0")}`;
              })()}
            />
            <ManageStudentsDialog
              isOpen={manageStudentsOpen}
              onClose={() => setManageStudentsOpen(false)}
              students={students}
              onSave={setStudents}
            />
            <ManageTeachersDialog
              isOpen={manageTeachersOpen}
              onClose={() => setManageTeachersOpen(false)}
              teachers={teachers}
              onSave={handleSaveTeachers}
            />
            <ManageTimeSlotsDialog
              isOpen={manageTimeSlotsOpen}
              onClose={() => setManageTimeSlotsOpen(false)}
              timeSlots={timeSlots}
              onSave={setTimeSlots}
            />
          </>
        )}
      </div>
    </DndProvider>
  );
}
