import { useEffect, useState } from 'react';
import { Teacher } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ManageTeachersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onSave: (teachers: Teacher[]) => void;
}

export function ManageTeachersDialog({
  isOpen,
  onClose,
  teachers,
  onSave,
}: ManageTeachersDialogProps) {
  const [editedTeachers, setEditedTeachers] = useState<Teacher[]>(teachers);

  // Keep local state fresh each time the dialog opens or teachers prop changes
  useEffect(() => {
    if (isOpen) setEditedTeachers(teachers);
  }, [isOpen, teachers]);

  const handleAddTeacher = () => {
    const newTeacher: Teacher = {
      id: `t${Date.now()}`,
      name: 'New Teacher',
    };
    setEditedTeachers((prev) => [...prev, newTeacher]);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setEditedTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  const handleUpdateTeacher = (teacherId: string, name: string) => {
    setEditedTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, name } : t)),
    );
  };

  const handleSave = () => {
    onSave(editedTeachers);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* NOTE: DialogContent now scrolls internally (from the global fix) */}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Manage Teachers</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {editedTeachers.length} teacher{editedTeachers.length !== 1 ? 's' : ''}
            </span>
            <Button size="sm" onClick={handleAddTeacher}>
              <Plus className="w-4 h-4 mr-1" />
              Add Teacher
            </Button>
          </div>

          <div className="space-y-2">
            {editedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center gap-2 p-3 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <Label className="sr-only">Teacher Name</Label>
                  <Input
                    value={teacher.name}
                    onChange={(e) => handleUpdateTeacher(teacher.id, e.target.value)}
                    placeholder="Teacher name"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                  disabled={editedTeachers.length === 1}
                  aria-label={`Delete ${teacher.name}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky footer pinned inside the scrollable DialogContent */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t -mx-6 px-6 py-3">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
