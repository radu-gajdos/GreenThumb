import React from 'react';
import { Inbox } from 'lucide-react';

interface CustomNoRowsOverlayProps {
    createButton?: React.ReactNode[];
}
export const CustomNoRowsOverlay: React.FC<CustomNoRowsOverlayProps> = ({ createButton }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white pointer-events-auto dark:bg-gray-900/50 h-full">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 max-w-md w-full flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-primary dark:text-primary-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Nu există date înregistrate.</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Nu există date disponibile în acest moment. Adăugați un nou element sau modificați filtrele.
        </p>
        {createButton && (
          <div className="!font-bold transform hover:scale-105 transition-transform duration-200 flex gap-2">
            {createButton}
          </div>
        )}
      </div>
    </div>
  );
};