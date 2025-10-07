import React, { useRef } from 'react';
import { Student, Lesson } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DollarSign, Calendar, X, GripVertical, Trash2 } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface StudentCardProps {
  student: Student;
  lesson: Lesson;
  onCancel?: (lessonId: string) => void;
  onEdit?: (student: Student, lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
}

export function StudentCard({
  student,
  lesson,
  onCancel,
  onEdit,
  onDelete,
}: StudentCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'STUDENT_CARD',
      item: { lesson, student },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [lesson, student]
  );

  drag(containerRef);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg p-3 cursor-move border transition-shadow hover:shadow-md 
      ${isDragging ? 'opacity-50' : ''}
      ${lesson.cancelled ? 'opacity-60 bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-700'}`}
      onClick={() => onEdit?.(student, lesson)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="truncate text-gray-900 dark:text-gray-100 font-medium">
                {student.name}
              </h4>
              {lesson.cancelled && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs border border-red-300 dark:border-red-700">
                  Cancelled
                </Badge>
              )}
              {lesson.isMakeup && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs border border-blue-300 dark:border-blue-700">
                  One-Time
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {lesson.sessionNumber}/{student.totalSessions}
                </span>
              </div>

              {/* Payment Badge */}
              <Badge
                className={`text-xs flex items-center gap-1 px-2 py-0.5 border ${
                  student.hasPaid
                    ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
                    : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                {student.hasPaid ? 'Paid' : 'Unpaid'}
              </Badge>

              {/* Makeup Lessons */}
              {student.makeupLessons > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 text-xs border border-yellow-300 dark:border-yellow-700">
                  {student.makeupLessons} Makeup
                  {student.makeupLessons > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {!lesson.cancelled && (
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.(lesson.id);
              }}
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(lesson.id);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
