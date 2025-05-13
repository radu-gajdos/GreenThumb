import { useSortable} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SelectColumnDropdown } from '../filters/SelectColumnDropdown';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Grid2x2, GripVertical, X } from 'lucide-react';
import React from 'react';
import { ColDefType } from '../interfaces/ColDefType';

interface Column {
    colId: string;
    sort: string;
    sortIndex: number;
}

interface SortableItemProps {
  column: Column;
  onUpdate: (field: string, value: any) => void;
  onDelete: (field: string) => void;
  setSelectOpen: (val: boolean) => void;
  columns: ColDefType[];
  selectColumns: ColDefType[];
  inDialogMode?: boolean; // New prop to determine if we're in a dialog
}

const SortableItem = ({ 
  column, 
  selectColumns, 
  onUpdate, 
  columns, 
  onDelete, 
  setSelectOpen, 
  inDialogMode = false 
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.colId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (inDialogMode) {
    // For mobile dialog mode - stack in a vertical layout
    return (
      <div 
        ref={setNodeRef}
        style={style}
        key={`sorable-${column.colId}`} 
        className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 mb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab dark:text-gray-600" />
            </div>
            <span className="text-sm font-medium dark:text-gray-300">
              {columns.find(attr => (attr.field ? attr.field : attr.colId) === column.colId)?.headerName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(column.colId)}
            className="hover:text-danger-500 hover:bg-danger-50 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={column.sort}
          onValueChange={(value: "asc"|"desc") => onUpdate("sort", value)}
        >
          <SelectTrigger className="w-full !capitalize h-9">
            <SelectValue>{column.sort}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"asc"}>Ascendent</SelectItem>
            <SelectItem value={"desc"}>Descendent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Regular desktop mode
  return (
    <div 
        ref={setNodeRef}
        style={style}
        key={`sorable-${column.colId}`} 
        className="flex gap-2 items-center px-5 py-2 bg-white dark:bg-gray-800"
    >
        <div {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab dark:text-gray-600" />
        </div>

        <SelectColumnDropdown trigger={
                <Button variant="outline" className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-60">
                    <span>
                        <div className="flex items-center gap-2 font-normal">
                            {columns.find(attr => (attr.field ? attr.field : attr.colId) === column.colId)?.icon && React.createElement(columns.find(attr => (attr.field ? attr.field : attr.colId) === column.colId)!.icon!, { className: "h-4 w-4" })}
                            {columns.find(attr => (attr.field ? attr.field : attr.colId) === column.colId)?.headerName}
                        </div>
                    </span>
                    <ChevronDown className='w-5 opacity-50'/>
                </Button>
            }
            key={`editField-${column.colId}-${column.sort}`}
            columns={selectColumns}
            onItemSelect={(field: string) => onUpdate("colId", field)}
            icon={Grid2x2}
            onOpenChange={(val) => {setSelectOpen(val);}}
        />

        <Select
            value={column.sort}
            onValueChange={(value: "asc"|"desc") => onUpdate("sort", value)}
        >
            <SelectTrigger className="w-40 !capitalize">
                <SelectValue>{column.sort}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={"asc"}>Ascendent</SelectItem>
                <SelectItem value={"desc"}>Descendent</SelectItem>
            </SelectContent>
        </Select>

        <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(column.colId)}
            className="hover:text-danger-500 hover:bg-danger-50"
        >
            <X className="h-4 w-4" />
        </Button>
    </div>
  );
};

export default SortableItem;