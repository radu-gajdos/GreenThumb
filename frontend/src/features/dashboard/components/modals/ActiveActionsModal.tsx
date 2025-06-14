import React from 'react';
import { Activity } from 'lucide-react';
import { ActiveActionsModalProps } from '../../types/active-actions';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ActiveActionsContent from './ActiveActionsComponent';

const ActiveActionsModal: React.FC<ActiveActionsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialFilter 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-6xl dialog-animation max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-start space-y-0 pb-2">
          <div className="flex items-start gap-3 flex-col">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
              <Activity className="w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Activități Active
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Gestionează activitățile în curs și planificate pentru terenurile tale.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          <ActiveActionsContent initialFilter={initialFilter} />
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ActiveActionsModal;