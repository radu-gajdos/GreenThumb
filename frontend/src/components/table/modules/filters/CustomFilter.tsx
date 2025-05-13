import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Filter as FilterIcon, Grid2x2, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectColumnDropdown } from './SelectColumnDropdown';
import { CellValue, getFiltersForField } from '../constants/filters';
import FilterValueField from './FilterValueField';
import { GridApi, IRowNode } from 'ag-grid-enterprise';
import { ColDefType } from '../interfaces/ColDefType';

type FilterCondition = 'contains' | 'equals' | 'startsWith' | 'endsWith';

interface Filter {
  id: number;
  field: string;
  condition: FilterCondition;
  value: CellValue;
}

interface CustomFilterProps {
    columns: ColDefType[];
    gridRef: any;
    inDialogMode?: boolean;
    externalFilters?: Filter[];
    onFilterChange?: (filters: Filter[]) => void;
}

const convertAgGridFilterModelToFilters = (
    filterModel: any,
    columns: ColDefType[]
  ): Filter[] => {
    if (!filterModel) return [];
    
    const filters: Filter[] = [];
    
    Object.entries(filterModel).forEach(([field, filterDef]: [string, any]) => {
      if (filterDef.filterType === 'set') {
        // Handle set filter
        filters.push({
          id: Date.now() + Math.random(),
          field,
          condition: 'equals',
          value: filterDef.values || []
        });
      } else if (filterDef.operator && filterDef.conditions) {
        // Handle multiple conditions
        filterDef.conditions.forEach((condition: any) => {
          filters.push({
            id: Date.now() + Math.random(),
            field,
            condition: condition.type,
            value: condition.filter
          });
        });
      } else {
        // Handle single condition
        filters.push({
          id: Date.now() + Math.random(),
          field,
          condition: filterDef.type as FilterCondition,
          value: filterDef.filter
        });
      }
    });
    
    return filters;
};

const CustomFilter: React.FC<CustomFilterProps> = ({ 
    columns, 
    gridRef, 
    inDialogMode = false,
    externalFilters,
    onFilterChange
}) => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const columnsForFilter = columns.filter(col => col.filter && (col.field || col.colId));
    
    // Adăugăm o referință pentru a urmări schimbările inițiate de noi
    const isUpdatingRef = useRef(false);
    
    // Inițializează filtrele din modelul AG Grid când componenta se încarcă
    useEffect(() => {
        if (gridRef?.current?.api) {
            const currentFilterModel = gridRef.current.api.getFilterModel();
            if (currentFilterModel && Object.keys(currentFilterModel).length > 0) {
                const convertedFilters = convertAgGridFilterModelToFilters(currentFilterModel, columns);
                setFilters(convertedFilters);
            }
        }
    }, [gridRef, columns]);
    
    // Ascultă la schimbările de filtre din AG Grid
    useEffect(() => {
        const handleFilterChanged = () => {
            // Dacă schimbarea a fost inițiată de noi, nu reacționăm la ea
            if (isUpdatingRef.current) return;
            
            if (gridRef?.current?.api) {
                const currentFilterModel = gridRef.current.api.getFilterModel();
                const convertedFilters = convertAgGridFilterModelToFilters(currentFilterModel, columns);
                setFilters(convertedFilters);
            }
        };
        
        if (gridRef?.current?.api) {
            gridRef.current.api.addEventListener('filterChanged', handleFilterChanged);
        }
        
        return () => {
            if (gridRef?.current?.api) {
                gridRef.current.api.removeEventListener('filterChanged', handleFilterChanged);
            }
        };
    }, [gridRef, columns]);

    // Funcție auxiliară pentru a aplica filtrele la AG Grid
    const applyFiltersToAgGrid = (newFilters: Filter[]) => {
        // Marcăm că noi inițiem schimbarea
        isUpdatingRef.current = true;
        
        // Aplicăm filtrele la AG Grid
        const newFilterModel = transformFiltersToAgGrid(newFilters, columns);
        gridRef.current!.api.setFilterModel(newFilterModel);
        
        // Resetăm flag-ul după un scurt delay pentru a permite procesarea
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 100);
    };

    const addFilter = (field: string): void => {
        const newFilter = {
            id: Date.now(),
            field,
            condition: getFiltersForField(field, columns)[0].value as FilterCondition,
            value: columns.find(col => col.field === field || col.colId === field)?.filter === 'agSetColumnFilter' 
                ? getUniqueFilteredValues(field, gridRef.current.api) 
                : ''
        };
        
        const newFilters = [...filters, newFilter];
        setFilters(newFilters);
        
        // Aplicăm filtrele folosind metoda noastră
        applyFiltersToAgGrid(newFilters);
        
        setIsAddMenuOpen(false);
    };
  
    const removeFilter = (id: number): void => {
        const newFilters = filters.filter(filter => filter.id !== id);
        setFilters(newFilters);
        
        // Aplicăm filtrele folosind metoda noastră
        applyFiltersToAgGrid(newFilters);
    };
  
    const updateFilter = (id: number, key: keyof Filter, value: CellValue): void => {
        let newFilters: Filter[] = [];
        
        if(key === 'field') {
            const newFieldValue = columns.find(col => col.field === value || col.colId === value)?.filter === 'agSetColumnFilter' 
                ? getUniqueFilteredValues(value as string, gridRef.current.api) 
                : '';
            // @ts-ignore
            newFilters = filters.map(filter => 
                filter.id === id ? { ...filter, field: value, 
                    value: columns.find(col => col.field === filter.field || col.colId === filter.field)?.filter === 'agSetColumnFilter' 
                        ? newFieldValue 
                        : columns.find(col => col.field === value || col.colId === value)?.filter === 'agSetColumnFilter' 
                            ? getUniqueFilteredValues(value as string, gridRef.current.api) 
                            : filter.value
                } : filter
            );
        } else {
            newFilters = filters.map(filter => 
                filter.id === id ? { ...filter, [key]: value } : filter
            );
        }
        
        setFilters(newFilters);
        
        // Aplicăm filtrele folosind metoda noastră
        applyFiltersToAgGrid(newFilters);
    };

    const clearAllFilters = (): void => {
        setFilters([]);
        setIsOpen(false);
        
        // Marcăm că noi inițiem schimbarea
        isUpdatingRef.current = true;
        gridRef.current!.api.setFilterModel(null);
        setTimeout(() => {
            isUpdatingRef.current = false;
        }, 100);
    };
    
    // Also make sure to update when external filters change
    useEffect(() => {
        if (externalFilters && JSON.stringify(externalFilters) !== JSON.stringify(filters)) {
            setFilters(externalFilters);
        }
    }, [externalFilters]);

    const transformFiltersToAgGrid = (filters: Filter[], columnDefs: ColDefType[]) => {
        const getFilterType = (field: string): string => {
            const column = columnDefs.find(col => col.field === field || col.colId === field);
            return column?.dataType ? (column?.dataType === 'string' ? 'text' : column?.dataType) : 'text';
        };
    
        const groupedFilters = filters.reduce((acc, filter) => {
            if (!acc[filter.field]) {
                acc[filter.field] = [];
            }
            acc[filter.field].push(filter);
            return acc;
        }, {} as Record<string, Filter[]>);
    
        const filterModel: Record<string, any> = {};
    
        for (const [field, fieldFilters] of Object.entries(groupedFilters)) {
            const filterType = getFilterType(field);
            const columnFilterType = columnDefs.find(col => col.field === field || col.colId === field)?.filter;
            
            if (fieldFilters.length === 1) {
                const filter = fieldFilters[0];
                if(columnFilterType && columnFilterType.includes('agSetColumnFilter')) {
                    filterModel[field] = {
                        filterType: 'set',
                        values: filter.value
                    };
                    continue;
                } else {
                    filterModel[field] = {
                        filterType,
                        type: filter.condition,
                        filter: filter.value
                    };
                }
            } else {
                if(columnFilterType && columnFilterType.includes('agSetColumnFilter')) {
                    filterModel[field] = {
                        operator: 'OR',
                        conditions: fieldFilters.map(filter => ({
                            filterType: 'set',
                            values: filter.value
                        }))
                    };
                } else {
                    filterModel[field] = {
                        operator: 'OR',
                        conditions: fieldFilters.map(filter => ({
                            filterType,
                            type: filter.condition,
                            filter: filter.value
                        }))
                    };
                }
            }
        }
    
        return filterModel;
    };

    const getUniqueFilteredValues = (columnKey: string, gridApi: GridApi) => {
        if (!gridApi) return [];
        
        const nodeValues = new Set<IRowNode>();
        const dataValues = new Set<any>();
        const formatedValues = new Set<string>();
        
        gridApi.forEachNode((node) => {
            if (node.data) {
                if(dataValues.has(node.data[columnKey])) return;
                dataValues.add(node.data[columnKey]);
                nodeValues.add(node);
            }
        });

        nodeValues.forEach(node => {
            const cellValue = gridApi.getCellValue({rowNode: node, colKey: columnKey});
            if (cellValue !== undefined && cellValue !== null) {
                formatedValues.add(cellValue);
            }
        });
        
        return Array.from(formatedValues);
    };

    // Render a single filter row
    const renderFilterRow = (filter: Filter, index: number) => {
        return (
            <div 
                key={filter.id} 
                className={inDialogMode ? "mb-4 p-3 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-800" : "flex items-center px-5 py-2"}
            >
                {inDialogMode ? (
                    // Dialog/Mobile mode
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="font-medium text-sm dark:text-gray-300">
                                {index === 0 ? "Where" : "And"}
                            </div>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFilter(filter.id)}
                                className="h-8 w-8 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="w-full">
                            <SelectColumnDropdown 
                                trigger={
                                    <Button 
                                        variant="outline" 
                                        className="flex h-9 items-center justify-between w-full"
                                    >
                                        <span>
                                            <div className="flex items-center gap-2 font-normal">
                                                {columns.find(col => col.field === filter.field || col.colId === filter.field)?.icon && 
                                                    React.createElement(
                                                        columns.find(col => col.field === filter.field || col.colId === filter.field)!.icon!, 
                                                        { className: "h-4 w-4" }
                                                    )
                                                }
                                                {columns.find(attr => attr.field === filter.field || attr.colId === filter.field)?.headerName}
                                            </div>
                                        </span>
                                        <ChevronDown className='h-4 w-4 opacity-50' />
                                    </Button>
                                }
                                columns={columnsForFilter}
                                onItemSelect={(field: string) => updateFilter(filter.id, 'field', field)}
                                icon={Grid2x2}
                                onOpenChange={(val) => {setSelectOpen(val);}}
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <Select
                                value={filter.condition}
                                onOpenChange={setSelectOpen}
                                onValueChange={(value: FilterCondition) => updateFilter(filter.id, 'condition', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue>
                                        {getFiltersForField(filter.field, columns).find(cond => cond.value === filter.condition)?.label}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {getFiltersForField(filter.field, columns).map(condition => (
                                        <SelectItem key={condition.value} value={condition.value}>
                                            {condition.label}  
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {!["blank", "notBlank"].includes(filter.condition) && (
                                <FilterValueField 
                                    key={`editValueField-${filter.id}-${filter.field}-${index}`}
                                    value={filter.value} 
                                    onChange={(value) => updateFilter(filter.id, 'value', value)} 
                                    filterColumnType={columns.find(col => col.field === filter.field || col.colId === filter.field)?.filter || ""}
                                    filterType={filter.condition}
                                    uniqueValues={
                                        gridRef.current?.api && 
                                        columns.find(col => col.field === filter.field || col.colId === filter.field)?.filter === 'agSetColumnFilter' 
                                            ? getUniqueFilteredValues(filter.field, gridRef.current.api) 
                                            : []
                                    }
                                    inDialogMode={true}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    // Regular desktop mode
                    <>
                        <div className="w-[60px] mr-2 text-sm">
                            {index === 0 ? "Where" : "And"}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1">
                            <SelectColumnDropdown 
                                trigger={
                                    <Button 
                                        variant="outline" 
                                        className="flex h-9 items-center justify-between w-48"
                                    >
                                        <span>
                                            <div className="flex items-center gap-2 font-normal">
                                                {columns.find(col => col.field === filter.field || col.colId === filter.field)?.icon && 
                                                    React.createElement(
                                                        columns.find(col => col.field === filter.field || col.colId === filter.field)!.icon!, 
                                                        { className: "h-4 w-4" }
                                                    )
                                                }
                                                {columns.find(attr => attr.field === filter.field || attr.colId === filter.field)?.headerName}
                                            </div>
                                        </span>
                                        <ChevronDown className='h-4 w-4 opacity-50' />
                                    </Button>
                                }
                                columns={columnsForFilter}
                                onItemSelect={(field: string) => updateFilter(filter.id, 'field', field)}
                                icon={Grid2x2}
                                onOpenChange={(val) => {setSelectOpen(val);}}
                            />
                            
                            <Select
                                value={filter.condition}
                                onOpenChange={setSelectOpen}
                                onValueChange={(value: FilterCondition) => updateFilter(filter.id, 'condition', value)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue>
                                        {getFiltersForField(filter.field, columns).find(cond => cond.value === filter.condition)?.label}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {getFiltersForField(filter.field, columns).map(condition => (
                                        <SelectItem key={condition.value} value={condition.value}>
                                            {condition.label}  
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {!["blank", "notBlank"].includes(filter.condition) && (
                                <FilterValueField 
                                    key={`editValueField-${filter.id}-${filter.field}-${index}`}
                                    value={filter.value} 
                                    onChange={(value) => updateFilter(filter.id, 'value', value)} 
                                    filterColumnType={columns.find(col => col.field === filter.field || col.colId === filter.field)?.filter || ""}
                                    filterType={filter.condition}
                                    uniqueValues={
                                        gridRef.current?.api && 
                                        columns.find(col => col.field === filter.field || col.colId === filter.field)?.filter === 'agSetColumnFilter' 
                                            ? getUniqueFilteredValues(filter.field, gridRef.current.api) 
                                            : []
                                    }
                                />
                            )}
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFilter(filter.id)}
                                className="h-9 w-9 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Render filter content (shared between dialog and popover modes)
    const renderFilterContent = () => (
        <div>
            <div className="text-sm text-gray-800 border-b py-3 px-5 dark:text-gray-300 dark:border-gray-700">
                {filters.length === 0 ? 
                    'Nu există filtre aplicate acestei vizualizări' :
                    'În această vizualizare afișează înregistrările care'}
            </div>

            <div className={filters.length > 0 ? 'py-2' : ''}>
                {filters.map((filter, index) => renderFilterRow(filter, index))}
            </div>
            
            <div className="flex justify-between py-3 border-t px-3 dark:border-gray-700">
                <SelectColumnDropdown 
                    trigger={
                        <Button 
                            variant="ghost" 
                            className="flex items-center gap-2 h-8 text-sm pr-4 ps-3 border-0 shadow-none text-gray-700 dark:text-gray-300"
                        >
                            <Plus className="h-4 w-4" />
                            Adaugă filtru
                        </Button>
                    }
                    columns={columnsForFilter}
                    onItemSelect={addFilter}
                    icon={Grid2x2}
                    isOpen={isAddMenuOpen}
                    onOpenChange={(val) => {setIsAddMenuOpen(val); setSelectOpen(val);}}
                />
                
                {filters.length > 0 && (
                    <Button 
                        variant="ghost" 
                        onClick={clearAllFilters} 
                        className="flex items-center gap-2 h-8 text-sm px-4 border-0 shadow-none text-gray-700 dark:text-gray-300"
                    >
                        Șterge toate filtrele
                    </Button>
                )}
            </div>
        </div>
    );

    // If in Dialog Mode (mobile), render without the Popover wrapper
    if (inDialogMode) {
        return (
            <div className="p-2">
                <h3 className="text-sm font-medium mb-3 dark:text-white">Gestionare filtre</h3>
                <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">
                    Adaugă filtre pentru a afina rezultatele tabelului.
                </p>
                {renderFilterContent()}
            </div>
        );
    }
    
    // Regular Popover mode for desktop
    return (
        <>
            <Popover open={isOpen} onOpenChange={(open) => !selectOpen && setIsOpen(open)} >
                <PopoverTrigger asChild>
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className={`flex items-center gap-2 text-sm whitespace-pre hover:text-primary hover:bg-gray-100 px-4 py-2 rounded-lg ${isOpen ? 'bg-gray-100' : ''} dark:hover:text-primary-300 dark:hover:bg-gray-800 dark:text-gray-300`}
                    >
                        <FilterIcon className="w-4 h-4" />
                        Filter {filters.length > 0 && `(${filters.length})`}
                    </button>
                </PopoverTrigger>
                
                <PopoverContent className="w-screen max-w-[46.17rem] p-0" sideOffset={5} align="start">
                    {renderFilterContent()}
                </PopoverContent>
            </Popover>
        </>
    );
};

export default CustomFilter;