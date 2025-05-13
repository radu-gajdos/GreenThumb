import React, { useState, useEffect, ForwardRefRenderFunction, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowUpDown, FilterIcon, Grid2x2, Plus } from 'lucide-react';
import { SelectColumnDropdown } from '../filters/SelectColumnDropdown';
import { Button } from '@/components/ui/button';
import SortableItem from './SortableItem';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColDefType } from '../interfaces/ColDefType';

export interface CustomSortingRef {
    refreshSorting: () => void;
}

interface CustomSortingProps {
    columns: ColDefType[];
    gridRef: any;
    inDialogMode?: boolean; // New prop to determine if we're in a dialog
}

interface SortCondition {
    colId: string;
    sort: string;
    sortIndex: number;
    index: number;
}

const CustomSortingComponent: ForwardRefRenderFunction<CustomSortingRef, CustomSortingProps> = ({ 
    columns, 
    gridRef, 
    inDialogMode = false 
}, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [sortConditions, setSortConditions] = useState<SortCondition[]>([]);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
    const isUpdatingRef = useRef(false);

    const refreshSorting = useCallback(() => {
        if (isUpdatingRef.current) return;

        const colState = gridRef.current?.api.getColumnState();
        const sortState = colState
            ?.filter((column: any) => column.sort != null)
            .map((column: any) => ({
                colId: column.colId,
                sort: column.sort,
                sortIndex: column.sortIndex,
                index: column.index
            })) || [];

        setSortConditions(sortState);
    }, [gridRef]);

    const clearSorting = () => {
        isUpdatingRef.current = true;
        gridRef.current?.api.applyColumnState({state: [], defaultState: { sort: null }});
        setSortConditions([]);
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 0);
        setIsOpen(false);
    };

    const addSortCondition = (field: string): void => {
        setSortConditions(prev => {
            const newConditions = [
                ...prev,
                { colId: field, sort: "asc", sortIndex: prev.length, index: prev.length },
            ];
            
            isUpdatingRef.current = true;
            gridRef.current?.api.applyColumnState({
                state: newConditions,
                defaultState: { sort: null },
            });
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
            
            return newConditions;
        });
    };

    useEffect(() => {
        // Initial load of sort conditions
        refreshSorting();

        // Add event listener for sort changed
        const onSortChanged = () => {
            if (!isUpdatingRef.current) {
                refreshSorting();
            }
        };

        gridRef.current?.api.addEventListener('sortChanged', onSortChanged);

        return () => {
            gridRef.current?.api.removeEventListener('sortChanged', onSortChanged);
        };
    }, [refreshSorting, gridRef]);

    useImperativeHandle(ref, () => ({
        refreshSorting,
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
            setSortConditions((items) => {
                const oldIndex = items.findIndex((item) => item.colId === active.id);
                const newIndex = items.findIndex((item) => item.colId === over.id);
                
                const newOrder = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
                    ...item,
                    sortIndex: index,
                    index: index,
                }));

                isUpdatingRef.current = true;
                gridRef.current?.api.applyColumnState({
                    state: newOrder,
                    defaultState: { sort: null },
                });
                setTimeout(() => {
                    isUpdatingRef.current = false;
                }, 0);

                return newOrder;
            });
        }
    }, [gridRef]);

    const updateSort = (field: string, value: string, colId: string) => {
        setSortConditions(prev => {
            const newConditions = prev.map((condition) => condition.colId === colId ? { ...condition, [field]: value } : condition);            
            isUpdatingRef.current = true;
            gridRef.current?.api.applyColumnState({
                state: newConditions,
                defaultState: { sort: null },
            });
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
            
            return newConditions;
        });
    };

    const deleteCustomSorting = (colId: string) => {
        isUpdatingRef.current = true;
        
        const newSortConditions = sortConditions
            .filter(condition => condition.colId !== colId)
            .map((condition, index) => ({
                ...condition,
                sortIndex: index,
                index: index
            }));
    
        setSortConditions(newSortConditions);
        
        gridRef.current?.api.applyColumnState({
            state: newSortConditions,
            defaultState: { sort: null },
        });
    
        requestAnimationFrame(() => {
            isUpdatingRef.current = false;
        });
    };

    // Render sorting content (shared between dialog and popover modes)
    const renderSortingContent = () => (
        <div>
            <div className="text-sm text-gray-800 border-b py-3 px-5 dark:text-gray-300 dark:border-gray-700">
                {sortConditions.length === 0 ? 
                    'Sortarea nu este aplicată acestei vizualizări' :
                    'Sortează după următoarele reguli'}
            </div>
            <div className={sortConditions.length > 0 ? 'py-2' : ''}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortConditions.map(condition => condition.colId)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {sortConditions.map((sortCondition) => (
                                <SortableItem
                                    key={`sortableItem-${sortCondition.colId}`}
                                    column={sortCondition}
                                    columns={columns}
                                    selectColumns={columns.filter(col => !sortConditions.find(condition => condition.colId === (col.colId ? col.colId : col.field)))}
                                    onUpdate={(a, b) => {updateSort(a,b,sortCondition.colId)}}
                                    onDelete={deleteCustomSorting}
                                    setSelectOpen={setSelectOpen}
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
                    columns={columns.filter(col => !sortConditions.find(condition => condition.colId === (col.colId ? col.colId : col.field)))}
                    onItemSelect={addSortCondition}
                    icon={Grid2x2}
                    isOpen={isAddMenuOpen}
                    onOpenChange={(val) => {setIsAddMenuOpen(val); setSelectOpen(val);}}
                />
                {sortConditions.length > 0 && (
                    <Button
                        variant="ghost"
                        onClick={clearSorting}
                        className="flex items-center gap-2 h-8 text-sm px-4 border-0 shadow-none text-gray-700 dark:text-gray-300"
                    >
                        Șterge sortarea
                    </Button>
                )}
            </div>
        </div>
    );
    
    // If in Dialog Mode (mobile), render without the Popover wrapper
    if (inDialogMode) {
        return (
            <div className="p-2">
                <h3 className="text-sm font-medium mb-3 dark:text-white">Gestionare sortare</h3>
                <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">
                    Trage și plasează elementele pentru a modifica prioritatea sortării. 
                    Adaugă coloane de sortare și selectează ordinea de sortare.
                </p>
                {renderSortingContent()}
            </div>
        );
    }
    
    // Regular Popover mode for desktop
    return (
        <Popover open={isOpen} onOpenChange={(open) => !selectOpen && setIsOpen(open)}>
            <PopoverTrigger asChild>
                <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 text-sm whitespace-pre hover:text-primary hover:bg-gray-100 px-4 py-2 rounded-lg ${isOpen ? 'bg-gray-100' : ''} dark:hover:text-primary-300 dark:hover:bg-gray-800 dark:text-gray-300`}>
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Sort {sortConditions.length > 0 && `(${sortConditions.length})`}</span>
                </button>
            </PopoverTrigger>
            
            <PopoverContent className="w-screen max-w-[520px] p-0" sideOffset={5} align="start">
                {renderSortingContent()}
            </PopoverContent>
        </Popover>
    );
};

const CustomSorting = forwardRef(CustomSortingComponent);
export default CustomSorting;