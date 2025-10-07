import { useState } from 'react';
import { Student } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ManageStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSave: (students: Student[]) => void;
}

export function ManageStudentsDialog({
  isOpen,
  onClose,
  students,
  onSave,
}: ManageStudentsDialogProps) {
  const [editedStudents, setEditedStudents] = useState<Student[]>(students);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: `s${Date.now()}`,
      name: 'New Student',
      totalSessions: 8,
      currentSession: 1,
      hasPaid: false,
      makeupLessons: 0,
    };
    setEditedStudents([...editedStudents, newStudent]);
    setSelectedStudent(newStudent);
  };

  const handleDeleteStudent = (studentId: string) => {
    setEditedStudents(editedStudents.filter((s) => s.id !== studentId));
    if (selectedStudent?.id === studentId) setSelectedStudent(null);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setEditedStudents(
      editedStudents.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setSelectedStudent(updatedStudent);
  };

  const handleSave = () => {
    onSave(editedStudents);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Students</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-[300px_1fr] gap-4 py-4">
          {/* Students List */}
          <div className="border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Students ({editedStudents.length})
              </span>
              <Button size="sm" onClick={handleAddStudent}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-2">
                {editedStudents.map((student) => {
                  const isSelected = selectedStudent?.id === student.id;
                  return (
                    <div
                      key={student.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors border bg-white dark:bg-neutral-900
                        border-gray-200 dark:border-gray-700
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400/60 dark:ring-blue-500/50' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm text-gray-900 dark:text-gray-100">
                            {student.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
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
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {student.currentSession}/{student.totalSessions}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStudent(student.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Student Name</Label>
                  <Input
                    value={selectedStudent.name}
                    onChange={(e) =>
                      handleUpdateStudent({ ...selectedStudent, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Current Session</Label>
                    <Input
                      type="number"
                      min="0"
                      max={selectedStudent.totalSessions}
                      value={selectedStudent.currentSession}
                      onChange={(e) =>
                        handleUpdateStudent({
                          ...selectedStudent,
                          currentSession: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Total Sessions</Label>
                    <Select
                      value={selectedStudent.totalSessions.toString()}
                      onValueChange={(value: string) =>
                        handleUpdateStudent({
                          ...selectedStudent,
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
                    value={selectedStudent.makeupLessons}
                    onChange={(e) =>
                      handleUpdateStudent({
                        ...selectedStudent,
                        makeupLessons: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Payment Status</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedStudent.hasPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    {/* Visible custom switch */}
<button
  type="button"
  onClick={() =>
    handleUpdateStudent({
      ...selectedStudent,
      hasPaid: !selectedStudent.hasPaid,
    })
  }
  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors 
    ${selectedStudent.hasPaid 
      ? 'bg-green-500 hover:bg-green-600' 
      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'}`}
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform 
      ${selectedStudent.hasPaid ? 'translate-x-4' : 'translate-x-0.5'}`}
  />
</button>

                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                Select a student to edit
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
