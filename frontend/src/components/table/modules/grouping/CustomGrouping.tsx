import React, { useState, useEffect, ForwardRefRenderFunction, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Group, Plus, Grid2x2 } from 'lucide-react';
import { SelectColumnDropdown } from '../filters/SelectColumnDropdown';
import { Button } from '@/components/ui/button';
import GroupableItem from './GroupableItem';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColDefType } from '../interfaces/ColDefType';

export interface CustomGroupingRef {
    refreshGrouping: () => void;
}

interface CustomGroupingProps {
    columns: ColDefType[];
    gridRef: any;
    inDialogMode?: boolean;
}

interface GroupCondition {
    field: string;
    index: number;
}

const CustomGroupingComponent: ForwardRefRenderFunction<CustomGroupingRef, CustomGroupingProps> = ({ 
    columns, 
    gridRef, 
    inDialogMode = false 
}, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [groupConditions, setGroupConditions] = useState<GroupCondition[]>([]);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
    const isUpdatingRef = useRef(false);

    // Filtrează coloanele care pot fi folosite pentru grupare
    const groupableColumns = columns.filter(col => 
        col.enableRowGroup === true && (col.field || col.colId)
    );

    const refreshGrouping = useCallback(() => {
        if (isUpdatingRef.current) return;

        const columnState = gridRef.current?.api.getColumnState();
        const rowGroupCols = gridRef.current?.api.getRowGroupColumns();
        
        if (rowGroupCols && rowGroupCols.length > 0) {
            const groupState = rowGroupCols.map((col: any, index: number) => ({
                field: col.colId,
                index
            }));
            
            setGroupConditions(groupState);
        } else {
            setGroupConditions([]);
        }
    }, [gridRef]);

    const clearGrouping = () => {
        isUpdatingRef.current = true;
        gridRef.current?.api.setRowGroupColumns([]);
        setGroupConditions([]);
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 100);
        setIsOpen(false);
    };

    const addGroupCondition = (field: string): void => {
        setGroupConditions(prev => {
            const newConditions = [
                ...prev,
                { field, index: prev.length },
            ];
            
            isUpdatingRef.current = true;
            gridRef.current?.api.setRowGroupColumns(
                newConditions.map(g => g.field)
            );
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 100);
            
            return newConditions;
        });
        setIsAddMenuOpen(false);
    };

    useEffect(() => {
        // Initial load of group conditions
        refreshGrouping();

        // Add event listener for row group changes
        const onRowGroupChanged = () => {
            if (!isUpdatingRef.current) {
                refreshGrouping();
            }
        };

        if (gridRef.current?.api) {
            gridRef.current.api.addEventListener('columnRowGroupChanged', onRowGroupChanged);
        }

        return () => {
            if (gridRef.current?.api) {
                gridRef.current.api.removeEventListener('columnRowGroupChanged', onRowGroupChanged);
            }
        };
    }, [refreshGrouping, gridRef]);

    useImperativeHandle(ref, () => ({
        refreshGrouping,
    }));

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setGroupConditions((items) => {
                const oldIndex = items.findIndex((item) => item.field === active.id);
                const newIndex = items.findIndex((item) => item.field === over.id);
                
                const newOrder = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
                    ...item,
                    index
                }));

                isUpdatingRef.current = true;
                gridRef.current?.api.setRowGroupColumns(
                    newOrder.map(g => g.field)
                );
                setTimeout(() => {
                    isUpdatingRef.current = false;
                }, 100);

                return newOrder;
            });
        }
    }, [gridRef]);

    const deleteGroupCondition = (field: string) => {
        isUpdatingRef.current = true;
        
        const newGroupConditions = groupConditions
            .filter(condition => condition.field !== field)
            .map((condition, index) => ({
                ...condition,
                index
            }));
    
        setGroupConditions(newGroupConditions);
        
        gridRef.current?.api.setRowGroupColumns(
            newGroupConditions.map(g => g.field)
        );
    
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 100);
    };

    // Render grouping content (shared between dialog and popover modes)
    const renderGroupingContent = () => (
        <div>
            <div className="text-sm text-gray-800 border-b py-3 px-5 dark:text-gray-300 dark:border-gray-700">
                {groupConditions.length === 0 ? 
                    'Gruparea nu este aplicată acestei vizualizări' :
                    'Grupare după următoarele coloane'}
            </div>
            <div className={groupConditions.length > 0 ? 'py-2' : ''}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={groupConditions.map(condition => condition.field)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {groupConditions.map((groupCondition) => (
                                <GroupableItem
                                    key={`groupableItem-${groupCondition.field}`}
                                    groupCondition={groupCondition}
                                    columns={columns}
                                    onDelete={deleteGroupCondition}
                                    inDialogMode={inDialogMode}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
            <div className="flex justify-between py-3 border-t px-3 !-mt-[1px] dark:border-gray-700">
                <SelectColumnDropdown
                    trigger={
                        <Button variant="ghost" className="flex items-center gap-2 h-8 text-sm pr-4 ps-3 border-0 shadow-none text-gray-700 dark:text-gray-300">
                            <Plus className="h-4 w-4" />
                            Adaugă coloană
                        </Button>
                    }
                    columns={groupableColumns.filter(col => 
                        !groupConditions.find(condition => 
                            condition.field === (col.colId || col.field)
                        )
                    )}
                    onItemSelect={addGroupCondition}
                    icon={Grid2x2}
                    isOpen={isAddMenuOpen}
                    onOpenChange={(val) => {setIsAddMenuOpen(val); setSelectOpen(val);}}
                />
                {groupConditions.length > 0 && (
                    <Button
                        variant="ghost"
                        onClick={clearGrouping}
                        className="flex items-center gap-2 h-8 text-sm px-4 border-0 shadow-none text-gray-700 dark:text-gray-300"
                    >
                        Șterge gruparea
                    </Button>
                )}
            </div>
        </div>
    );
    
    // If in Dialog Mode (mobile), render without the Popover wrapper
    if (inDialogMode) {
        return (
            <div className="p-2">
                <h3 className="text-sm font-medium mb-3 dark:text-white">Gestionare grupare</h3>
                <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">
                    Trage și plasează elementele pentru a modifica ordinea grupării.
                    {groupableColumns.length === 0 && " Nu există coloane disponibile pentru grupare."}
                </p>
                {groupableColumns.length > 0 ? (
                    renderGroupingContent()
                ) : (
                    <div className="flex justify-center items-center p-6 text-gray-500 dark:text-gray-400">
                        Nu există coloane configurate pentru grupare.
                    </div>
                )}
            </div>
        );
    }
    
    // Regular Popover mode for desktop
    return (
        <Popover open={isOpen} onOpenChange={(open) => !selectOpen && setIsOpen(open)}>
            <PopoverTrigger asChild>
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`flex items-center gap-2 text-sm whitespace-pre hover:text-primary hover:bg-gray-100 px-4 py-2 rounded-lg ${isOpen ? 'bg-gray-100' : ''} dark:hover:text-primary-300 dark:hover:bg-gray-800 dark:text-gray-300`}
                >
                    <Group className="w-4 h-4" />
                    <span>Grupare {groupConditions.length > 0 && `(${groupConditions.length})`}</span>
                </button>
            </PopoverTrigger>
            
            <PopoverContent className="w-screen max-w-[520px] p-0" sideOffset={5} align="start">
                {groupableColumns.length > 0 ? (
                    renderGroupingContent()
                ) : (
                    <div className="text-sm text-gray-800 py-5 px-5 dark:text-gray-300">
                        Nu există coloane configurate pentru grupare. 
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

const CustomGrouping = forwardRef(CustomGroupingComponent);
export default CustomGrouping;