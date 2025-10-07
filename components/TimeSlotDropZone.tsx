import React, { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { Student, Lesson } from "../types";
import { StudentCard } from "./StudentCard";
import { Plus } from "lucide-react";

interface TimeSlotDropZoneProps {
  time: string;
  lesson: Lesson | null;
  student: Student | null;
  onDrop?: (lesson: Lesson, student: Student, newTimeSlot: string) => void;
  onCancel?: (lessonId: string) => void;
  onEdit?: (student: Student, lesson: Lesson) => void;
  onAddLesson?: (timeSlot: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
}

export function TimeSlotDropZone({
  time,
  lesson,
  student,
  onDrop,
  onCancel,
  onEdit,
  onAddLesson,
  onDeleteLesson,
}: TimeSlotDropZoneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    { lesson: Lesson; student: Student },
    void,
    { isOver: boolean; canDrop: boolean }
  >(() => ({
    accept: "STUDENT_CARD",
    drop: (item) => {
      if (item.lesson.timeSlot !== time) {
        onDrop?.(item.lesson, item.student, time);
      }
    },
    canDrop: () => !lesson, // only drop if slot empty
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [lesson, onDrop, time]);

  // hook up the drop target
  useEffect(() => {
    if (containerRef.current) drop(containerRef);
  }, [drop]);

  // ✅ Only format if there's no AM/PM present
  const prettyTime = (t: string) => {
    if (/\b(am|pm)\b/i.test(t)) {
      // normalize spacing/case: "3:00 pm" -> "3:00 PM"
      const [hhmm, ap] = t.trim().split(/\s+/);
      return `${hhmm} ${ap?.toUpperCase() ?? ""}`.trim();
    }
    // assume 24h "HH:MM"
    const [hh, mm] = t.split(":");
    const h24 = parseInt(hh, 10);
    const ampm = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${mm.padStart(2, "0")} ${ampm}`;
  };

  return (
    <div
      ref={containerRef}
      className={`flex gap-3 p-3 border-b border-border last:border-b-0 min-h-[80px] transition-colors ${
        isOver && canDrop ? "bg-accent" : ""
      } ${canDrop && !lesson ? "bg-accent/30" : ""}`}
    >
      <div className="w-24 flex-shrink-0 text-muted-foreground">
        {prettyTime(time)}
      </div>

      <div className="flex-1">
        {lesson && student ? (
          <StudentCard
            student={student}
            lesson={lesson}
            onCancel={onCancel}
            onEdit={onEdit}
            onDelete={onDeleteLesson}
          />
        ) : (
          <button
            onClick={() => onAddLesson?.(time)}
            className="h-full w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isOver && canDrop ? "Drop here" : "Add Lesson"}
          </button>
        )}
      </div>
    </div>
  );
}
