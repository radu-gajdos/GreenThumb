import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';

interface ModalDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
}

const ModalDelete: React.FC<ModalDeleteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  confirmText
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogTitle className="hidden">Confirm Delete</AlertDialogTitle>
      <AlertDialogContent className="max-w-[400px] p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center">
          <Trash2 className="h-10 w-10 text-gray-400" />
        </div>
        
        <h6 className="text-md text-center text-gray-500 pb-2">
          {confirmText}
        </h6>
        
        <div className="flex justify-center gap-3 w-full">
          <AlertDialogCancel className="mt-0 flex-1 max-w-[140px]">
            No, cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="flex-1 max-w-[140px] bg-danger hover:bg-danger-700"
          >
            Yes, I'm sure
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModalDelete;