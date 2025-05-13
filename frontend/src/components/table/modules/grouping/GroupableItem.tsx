import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';
import React from 'react';
import { ColDefType } from '../interfaces/ColDefType';

interface GroupCondition {
    field: string;
    index: number;
}

interface GroupableItemProps {
    groupCondition: GroupCondition;
    columns: ColDefType[];
    onDelete: (field: string) => void;
    inDialogMode?: boolean;
}

const GroupableItem = ({ 
    groupCondition, 
    columns, 
    onDelete, 
    inDialogMode = false 
}: GroupableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: groupCondition.field });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const column = columns.find(col => 
        (col.field || col.colId) === groupCondition.field
    );

    if (inDialogMode) {
        // For mobile dialog mode - stack in a vertical layout
        return (
            <div 
                ref={setNodeRef}
                style={style}
                key={`groupable-${groupCondition.field}`} 
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 mb-2"
            >
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners}>
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab dark:text-gray-600" />
                    </div>
                    <span className="text-sm font-medium dark:text-gray-300">
                        {column?.headerName || groupCondition.field}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(groupCondition.field)}
                    className="hover:text-danger-500 hover:bg-danger-50 h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // Regular desktop mode
    return (
        <div 
            ref={setNodeRef}
            style={style}
            key={`groupable-${groupCondition.field}`} 
            className="flex gap-2 items-center px-5 py-2 bg-white dark:bg-gray-800"
        >
            <div {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab dark:text-gray-600" />
            </div>

            <div className="flex items-center gap-2 font-normal flex-1">
                {column?.icon && React.createElement(column.icon, { className: "h-4 w-4" })}
                <span className="dark:text-gray-300">
                    {column?.headerName || groupCondition.field}
                </span>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(groupCondition.field)}
                className="hover:text-danger-500 hover:bg-danger-50"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default GroupableItem;