import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeletePatternDialogProps {
  open: boolean;
  patternName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePatternDialog({ open, patternName, onConfirm, onCancel }: DeletePatternDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Delete pattern?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            This will remove <span className="font-medium text-foreground">{patternName}</span> and all its future scheduled revisits.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl"
          >
            Keep
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
