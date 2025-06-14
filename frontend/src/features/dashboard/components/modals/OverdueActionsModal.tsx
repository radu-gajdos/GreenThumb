import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ActiveActionsModalProps } from '../../types/active-actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OverdueActionsContent from './OverdueActionsContent';

const OverdueActionsModal: React.FC<ActiveActionsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialFilter 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="sm:max-w-6xl dialog-animation max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-start space-y-0 pb-2">
          <div className="flex items-start gap-3 flex-col">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-red-50 border-red-200">
              <AlertTriangle className="w-4 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-red-900">
                Activități Întârziate
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Acțiuni care au depășit data programată și necesită atenție imediată.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          <OverdueActionsContent initialFilter={initialFilter} />
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default OverdueActionsModal;