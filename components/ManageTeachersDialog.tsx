import { useState } from 'react';
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

  const handleAddTeacher = () => {
    const newTeacher: Teacher = {
      id: `t${Date.now()}`,
      name: 'New Teacher',
    };
    setEditedTeachers([...editedTeachers, newTeacher]);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setEditedTeachers(editedTeachers.filter((t) => t.id !== teacherId));
  };

  const handleUpdateTeacher = (teacherId: string, name: string) => {
    setEditedTeachers(
      editedTeachers.map((t) => (t.id === teacherId ? { ...t, name } : t))
    );
  };

  const handleSave = () => {
    onSave(editedTeachers);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Teachers</DialogTitle>
        </DialogHeader>
        
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
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}