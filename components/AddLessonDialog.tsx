import { useState } from 'react';
import { Student, Teacher } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AddLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (studentId: string, sessionNumber: number, isMakeup: boolean) => void;
  students: Student[];
  timeSlot: string; // assumed "HH:mm" or whatever you use now
  teacher: Teacher | null;
  date: string;     // "YYYY-MM-DD"
}

export function AddLessonDialog({
  isOpen,
  onClose,
  onAdd,
  students,
  timeSlot,
  teacher,
  date,
}: AddLessonDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [lessonType, setLessonType] = useState<'regular' | 'makeup'>('regular');
  const [saving, setSaving] = useState(false);

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);
    if (student) {
      // Default to their next session
      setSessionNumber(student.currentSession);
    }
  };

  // ⬇️ call server to create 1 or many lessons depending on "regular"/"makeup"
  const handleAdd = async () => {
    if (!selectedStudentId || !teacher?.id) return;

    setSaving(true);
    try {
      // your server POST expects: { lesson, repeatWeekly, weeks }
      const lesson = {
        id: crypto.randomUUID(),
        teacherId: teacher.id,
        studentId: selectedStudentId,
        date,             // e.g. "2025-10-22"
        start: timeSlot,  // keep your existing slot format
        // end: optional — include if your API uses it
        sessionNumber,    // keep extra fields if you want them in storage
        type: lessonType, // "regular" | "makeup"
      };

      await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson,
          repeatWeekly: lessonType === 'regular', // <-- weekly series if Regular
          weeks: 12,                              // adjust as you like
        }),
      });

      // keep your old local behavior
      onAdd(selectedStudentId, sessionNumber, lessonType === 'makeup');

      // reset & close
      setSelectedStudentId('');
      setSessionNumber(1);
      setLessonType('regular');
      onClose();
    } catch (err) {
      console.error('Failed to add lesson', err);
      // optionally show a toast here
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Teacher</Label>
            <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
              {teacher?.name}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
                {formatDate(date)}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Time</Label>
              <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
                {formatTime(timeSlot)}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Student</Label>
            <Select value={selectedStudentId} onValueChange={handleStudentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.currentSession}/{student.totalSessions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Session Number</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedStudent.totalSessions}
                  value={sessionNumber}
                  onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Total Sessions</Label>
                <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
                  {selectedStudent.totalSessions}
                </div>
              </div>
            </div>
          )}

          {selectedStudent && (
            <div className="grid gap-3">
              <Label>Lesson Type</Label>
              <RadioGroup
                value={lessonType}
                onValueChange={(value: string) => setLessonType(value as 'regular' | 'makeup')}
              >
                <div className="flex items-start space-x-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value="regular" id="regular" className="mt-0.5" />
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="regular" className="cursor-pointer">
                      Regular Lesson
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      This is a permanent schedule change — the student will have their lesson at this time every week.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value="makeup" id="makeup" className="mt-0.5" />
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="makeup" className="cursor-pointer">
                      Makeup Lesson (One-Time)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      This is only for this week — next week the student returns to their regular time.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedStudentId || !teacher?.id || saving}>
            {saving ? 'Adding…' : 'Add Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
