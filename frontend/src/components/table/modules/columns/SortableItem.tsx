import React from 'react';
import { GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Column {
  id: number;
  index: number;
  name: string;
  visible: boolean;
}

interface SortableItemProps {
  column: Column;
  onVisibilityChange: (id: number) => void;
}

const SortableItem = ({ column, onVisibilityChange }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border px-3 py-2 rounded-md flex items-center justify-between bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-2 text-sm dark:text-gray-300">
        <div {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab dark:text-gray-500" />
        </div>
        {column.name}
      </div>
      <Switch 
        id={`checkBox-${column.id}`}
        checked={column.visible}
        onCheckedChange={() => onVisibilityChange(column.id)}
      />
    </div>
  );
};

export default SortableItem;