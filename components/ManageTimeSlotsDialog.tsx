import { useState } from 'react';
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
import { ScrollArea } from './ui/scroll-area';

interface ManageTimeSlotsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeSlots: string[];
  onSave: (timeSlots: string[]) => void;
}

export function ManageTimeSlotsDialog({
  isOpen,
  onClose,
  timeSlots,
  onSave,
}: ManageTimeSlotsDialogProps) {
  const [editedSlots, setEditedSlots] = useState<string[]>(timeSlots);
  const [newSlot, setNewSlot] = useState('');

  const handleAddSlot = () => {
    if (newSlot && !editedSlots.includes(newSlot)) {
      const newSlots = [...editedSlots, newSlot].sort();
      setEditedSlots(newSlots);
      setNewSlot('');
    }
  };

  const handleDeleteSlot = (slot: string) => {
    setEditedSlots(editedSlots.filter((s) => s !== slot));
  };

  const handleSave = () => {
    onSave(editedSlots);
    onClose();
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Time Slots</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="sr-only">New Time Slot</Label>
              <Input
                type="time"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                placeholder="Add new time slot"
              />
            </div>
            <Button onClick={handleAddSlot} disabled={!newSlot}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="border border-border rounded-lg">
            <div className="p-3 border-b border-border">
              <span className="text-sm">
                {editedSlots.length} time slot{editedSlots.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-1">
                {editedSlots.map((slot) => (
                  <div
                    key={slot}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span>{formatTime(slot)}</span>
                      <span className="text-sm text-muted-foreground">({slot})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteSlot(slot)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
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