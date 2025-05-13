import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Columns2 } from 'lucide-react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface Column {
  id: number;
  index: number;
  name: string; // headerName
  visible: boolean;
  identifier: string; // colId ? colId : field
}

interface ColumnReorderPopoverProps {
  columns: Column[];
  gridRef: any;
  inDialogMode?: boolean; // New prop to determine if we're in a dialog
}

const ColumnReorderPopover = ({ columns: initialColumns, gridRef, inDialogMode = false }: ColumnReorderPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>(() =>
    initialColumns.map(col => ({ ...col, visible: true }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // When we modify the order, update in ag grid through api
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
        const oldIndex = columns.findIndex((item) => item.id === active.id);
        const newIndex = columns.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(columns, oldIndex, newIndex).map((item, index) => ({
          ...item,
          columns
        }));

        const columnOrder = newOrder.map(col => col.identifier);
        gridRef.current.api.moveColumns(columnOrder, 0);
    }
  }, [columns, gridRef]);

  // When we change visibility, update in ag grid through api
  const handleVisibilityChange = useCallback((id: number) => {
    const currentCol = columns.find(col => col.id === id);
    gridRef.current.api.setColumnsVisible([currentCol!.identifier], !currentCol!.visible);
  }, [columns, gridRef]);

  // Count how many columns are visible
  const visibleColumnsCount = columns.filter(col => col.visible).length;

  // When column changes in the table, update state in component
  const handleColumnChange = () => {
    const currentColumns = gridRef.current.api.getColumnState();
    if (!currentColumns) return;
    setColumns(currentColumns.map((col: any, index: number) => ({
      id: index + 1,
      index,
      name: columns.find(c => c.identifier === col.colId)?.name || "",
      visible: !col.hide,
      identifier: col.colId
    })));
  }

  // When we initialize the component, set columns from api
  useEffect(() => {
    handleColumnChange(); 
  }, []);

  // Connect events from ag grid with component functions
  useEffect(() => {
    if (gridRef.current?.api) {
      const gridApi = gridRef.current.api;

      // Add event listener for column visibility changes
      gridApi.addEventListener("columnMoved", handleColumnChange);
      gridApi.addEventListener("columnVisible", handleColumnChange);

      // Cleanup on component unmount
      return () => {
        gridApi.removeEventListener("columnMoved", handleColumnChange);
        gridApi.removeEventListener("columnVisible", handleColumnChange);
      };
    }
  }, [gridRef]);
  
  // In Dialog Mode, render without the Popover wrapper
  if (inDialogMode) {
    return (
      <div className="p-2">
        <h3 className="text-sm font-medium mb-3 dark:text-white">Gestionare coloane</h3>
        <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">
          Trage și plasează coloanele pentru a le reordona. Activează/dezactivează vizibilitatea coloanelor folosind comutatoarele.
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns}
            strategy={verticalListSortingStrategy}
          >
            <div className="gap-2 flex flex-col">
              {columns.map((column) => (
                <SortableItem
                  key={`sss-${column.id}`}
                  column={column}
                  onVisibilityChange={handleVisibilityChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }
  
  // Regular popover mode
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className={`flex items-center gap-2 text-sm hover:text-primary hover:bg-gray-100 px-2 py-2 whitespace-pre rounded-lg ${isOpen ? 'bg-gray-100' : ''} dark:hover:text-primary-300 dark:hover:bg-gray-800 dark:text-gray-300`}>
          <Columns2 className="w-4 h-4" />
          Column {visibleColumnsCount > 0 && `(${visibleColumnsCount})`}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-h-[400px] overflow-y-auto flex flex-col py-2 px-2" sideOffset={5} align="start">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns}
            strategy={verticalListSortingStrategy}
          >
            <div className="gap-2 flex flex-col">
              {columns.map((column) => (
                <SortableItem
                  key={`sss-${column.id}`}
                  column={column}
                  onVisibilityChange={handleVisibilityChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnReorderPopover;