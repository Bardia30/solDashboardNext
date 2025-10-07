import { useState } from 'react';
import { Student, Lesson } from '../types';
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
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';

interface StudentDialogProps {
  student: Student | null;
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  onSaveLesson?: (lesson: Lesson) => void;
}

export function StudentDialog({ student, lesson, isOpen, onClose, onSave, onSaveLesson }: StudentDialogProps) {
  const [editedStudent, setEditedStudent] = useState<Student | null>(student);
  const [editedLesson, setEditedLesson] = useState<Lesson | null>(lesson);

  if (!student || !editedStudent) return null;

  const handleSave = () => {
    onSave(editedStudent);
    if (editedLesson && onSaveLesson) {
      onSaveLesson(editedLesson);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Student Name</Label>
            <Input
              value={editedStudent.name}
              onChange={(e) =>
                setEditedStudent({ ...editedStudent, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Current Session</Label>
              <Input
                type="number"
                min="0"
                max={editedStudent.totalSessions}
                value={editedStudent.currentSession}
                onChange={(e) =>
                  setEditedStudent({
                    ...editedStudent,
                    currentSession: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Total Sessions</Label>
              <Select
                value={editedStudent.totalSessions.toString()}
                onValueChange={(value: string) =>
                  setEditedStudent({
                    ...editedStudent,
                    totalSessions: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 Sessions</SelectItem>
                  <SelectItem value="8">8 Sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Makeup Lessons</Label>
            <Input
              type="number"
              min="0"
              value={editedStudent.makeupLessons}
              onChange={(e) =>
                setEditedStudent({
                  ...editedStudent,
                  makeupLessons: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Payment Status</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {editedStudent.hasPaid ? 'Paid' : 'Unpaid'}
              </span>
              <Switch
                checked={editedStudent.hasPaid}
                onCheckedChange={(checked: any) =>
                  setEditedStudent({ ...editedStudent, hasPaid: checked })
                }
              />
            </div>
          </div>

          {editedLesson && (
            <>
              <Separator />
              
              <div>
                <h3 className="mb-3">Lesson Details</h3>
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Session Number for This Lesson</Label>
                    <Input
                      type="number"
                      min="1"
                      max={editedStudent.totalSessions}
                      value={editedLesson.sessionNumber}
                      onChange={(e) =>
                        setEditedLesson({
                          ...editedLesson,
                          sessionNumber: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Which session number this lesson counts as (out of {editedStudent.totalSessions} total)
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Label>Lesson Type</Label>
                    <RadioGroup 
                      value={editedLesson.isMakeup ? 'makeup' : 'regular'} 
                      onValueChange={(value: string) =>
                        setEditedLesson({ ...editedLesson, isMakeup: value === 'makeup' })
                      }
                    >
                      <div className="flex items-start space-x-3 rounded-lg border border-border p-3">
                        <RadioGroupItem value="regular" id="edit-regular" className="mt-0.5" />
                        <div className="grid gap-1.5 flex-1">
                          <Label htmlFor="edit-regular" className="cursor-pointer">
                            Regular Lesson
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Permanent schedule change - recurring every week
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-lg border border-border p-3">
                        <RadioGroupItem value="makeup" id="edit-makeup" className="mt-0.5" />
                        <div className="grid gap-1.5 flex-1">
                          <Label htmlFor="edit-makeup" className="cursor-pointer">
                            Makeup Lesson (One-Time)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Only for this week - returns to regular time next week
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}