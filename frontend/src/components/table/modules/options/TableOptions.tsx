import React, { useState, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Columns, ArrowUpDown, Group, ListFilter } from 'lucide-react';
import ColumnReorderPopover from '../columns/CustomColumns';
import CustomSorting, { CustomSortingRef } from '../sorting/CustomSorting';
import CustomFilter from '../filters/CustomFilter';
import { ColDefType } from '../interfaces/ColDefType';
import CustomGrouping, { CustomGroupingRef } from '../grouping/CustomGrouping';

interface TableOptionsProps<T> {
  gridRef: React.RefObject<AgGridReact<T>>;
  columns: ColDefType<T>[];
  isCompact: boolean;
  tableOptionsOpen?: boolean;
  setTableOptionsOpen?: (open: boolean) => void;
  // Control which modules are displayed
  modules?: {
    columns?: boolean;
    sorting?: boolean;
    filters?: boolean;
    grouping?: boolean;
  };
}

const TableOptions = <T extends { id?: string },>({ 
  gridRef, 
  columns,
  isCompact,
  tableOptionsOpen: externalTableOptionsOpen,
  setTableOptionsOpen: externalSetTableOptionsOpen,
  modules = { columns: true, sorting: true, filters: true, grouping: true } // Default - show all modules
}: TableOptionsProps<T>) => {
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [columnsCount, setColumnsCount] = useState<number>(0);
  const [filtersCount, setFiltersCount] = useState<number>(0);
  const [sortingCount, setSortingCount] = useState<number>(0);
  const [groupingCount, setGroupingCount] = useState<number>(0);

  // Use external state if provided, otherwise use local state
  const [internalTableOptionsOpen, setInternalTableOptionsOpen] = useState<boolean>(false);
  const tableOptionsOpen = externalTableOptionsOpen !== undefined ? externalTableOptionsOpen : internalTableOptionsOpen;
  const setTableOptionsOpen = externalSetTableOptionsOpen || setInternalTableOptionsOpen;
  
  const [activeOption, setActiveOption] = useState<string>('');
  const sortingRef = useRef<CustomSortingRef>(null);
  const groupingRef = useRef<CustomGroupingRef>(null); // Adaugă această referință

  // Adaugă un efect pentru a urmări numărul de grupări
  useEffect(() => {
    if (gridRef.current?.api) {
      const updateGroupingCount = () => {
        const rowGroupCols = gridRef.current?.api.getRowGroupColumns();
        setGroupingCount(rowGroupCols?.length || 0);
      };
      
      updateGroupingCount();
      
      gridRef.current.api.addEventListener('columnRowGroupChanged', updateGroupingCount);
      
      return () => {
        if (gridRef.current?.api) {
          gridRef.current.api.removeEventListener('columnRowGroupChanged', updateGroupingCount);
        }
      };
    }
  }, [gridRef]);
  
  // Adaugă efecte pentru a actualiza contoarele
  useEffect(() => {
    if (gridRef.current?.api) {
      // Contorizează coloanele vizibile
      const updateColumnsCount = () => {
        const columnState = gridRef.current?.api.getColumnState();
        const visibleColumnsCount = columnState!.filter((col: any) => !col.hide).length;
        setColumnsCount(visibleColumnsCount);
      };
      
      // Contorizează filtrele active
      const updateFiltersCount = () => {
        const filterModel = gridRef.current?.api.getFilterModel();
        setFiltersCount(Object.keys(filterModel || {}).length);
      };
      
      // Contorizează sortările active
      const updateSortingCount = () => {
        const columnState = gridRef.current?.api.getColumnState();
        const sortedColumnsCount = columnState!.filter((col: any) => col.sort).length;
        setSortingCount(sortedColumnsCount);
      };
      
      // Inițial contorizăm
      updateColumnsCount();
      updateFiltersCount();
      updateSortingCount();
      
      // Adăugăm listeneri pentru actualizări
      gridRef.current.api.addEventListener('columnVisible', updateColumnsCount);
      gridRef.current.api.addEventListener('filterChanged', updateFiltersCount);
      gridRef.current.api.addEventListener('sortChanged', updateSortingCount);
      
      return () => {
        // Curățăm listenerii
        const api = gridRef.current?.api;
        if (api) {
          api.removeEventListener('columnVisible', updateColumnsCount);
          api.removeEventListener('filterChanged', updateFiltersCount);
          api.removeEventListener('sortChanged', updateSortingCount);
        }
      };
    }
  }, [gridRef]);

  // When in compact (mobile) mode, use a dialog for options
  if (isCompact) {
    // Calculate the number of columns to display in the grid based on available modules
    const enabledModulesCount = Object.values(modules).filter(Boolean).length;
    const gridColsClass = enabledModulesCount === 1 ? 'grid-cols-1' : 
                          enabledModulesCount === 2 ? 'grid-cols-2' : 
                          enabledModulesCount === 3 ? 'grid-cols-3' : 
                          'grid-cols-2'; // Default to 2 columns for 4 modules

    return (
      <Dialog open={tableOptionsOpen} onOpenChange={setTableOptionsOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-lg dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Opțiuni Tabel</h2>
          </div>
          
          <div className={`grid ${gridColsClass} gap-3`}>
            {modules.columns && (
              <button 
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                  activeOption === 'columns' 
                  ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/30 dark:border-blue-800' 
                  : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => setActiveOption('columns')}
              >
                <div className={`p-3 rounded-full mb-3 ${
                  activeOption === 'columns' 
                  ? 'bg-blue-100 dark:bg-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Columns className={`h-5 w-5 ${
                    activeOption === 'columns' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <span className={`font-medium ${
                  activeOption === 'columns' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Coloane {columnsCount > 0 && `(${columnsCount})`}
                </span>
              </button>
            )}

            {modules.sorting && (
              <button 
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                  activeOption === 'sorting' 
                  ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/30 dark:border-blue-800' 
                  : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => setActiveOption('sorting')}
              >
                <div className={`p-3 rounded-full mb-3 ${
                  activeOption === 'sorting' 
                  ? 'bg-blue-100 dark:bg-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <ArrowUpDown className={`h-5 w-5 ${
                    activeOption === 'sorting' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <span className={`font-medium ${
                  activeOption === 'sorting' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Sortare {sortingCount > 0 && `(${sortingCount})`}
                </span>
              </button>
            )}

            {modules.filters && (
              <button 
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                  activeOption === 'filters' 
                  ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/30 dark:border-blue-800' 
                  : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => setActiveOption('filters')}
              >
                <div className={`p-3 rounded-full mb-3 ${
                  activeOption === 'filters' 
                  ? 'bg-blue-100 dark:bg-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <ListFilter className={`h-5 w-5 ${
                    activeOption === 'filters' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <span className={`font-medium ${
                  activeOption === 'filters' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Filtre {filtersCount > 0 && `(${filtersCount})`}
                </span>
              </button>
            )}

            {modules.grouping && (
                <button 
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                    activeOption === 'group' 
                    ? 'bg-blue-50 border-blue-200 shadow-sm dark:bg-blue-900/30 dark:border-blue-800' 
                    : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20'
                  }`}
                  onClick={() => setActiveOption('group')}
                >
                  <div className={`p-3 rounded-full mb-3 ${
                    activeOption === 'group' 
                    ? 'bg-blue-100 dark:bg-blue-800' 
                    : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Group className={`h-5 w-5 ${
                      activeOption === 'group' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    activeOption === 'group' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    Grupare {groupingCount > 0 && `(${groupingCount})`}
                  </span>
                </button>
              )}
          </div>
          
          {/* Option content area */}
          <div className="mt-6 border-t pt-4 dark:border-gray-700">
            {activeOption === 'columns' && modules.columns && (
              <div className="max-h-[400px] overflow-y-auto">
                <ColumnReorderPopover 
                  columns={columns.map((col, index) => ({
                    id: index + 1,
                    index,
                    name: col.headerName || "",
                    identifier: col.field || col.colId || col.headerName || '',
                    visible: true
                  }))} 
                  gridRef={gridRef}
                  inDialogMode={true}
                />
              </div>
            )}
            
            {activeOption === 'sorting' && modules.sorting && (
              <div className="max-h-[400px] overflow-y-auto">
                <CustomSorting 
                  ref={sortingRef} 
                  columns={columns} 
                  gridRef={gridRef}
                  inDialogMode={true}
                />
              </div>
            )}
            
            {activeOption === 'filters' && modules.filters && (
              <div className="max-h-[400px] overflow-y-auto">
                <CustomFilter 
                  columns={columns} 
                  gridRef={gridRef}
                  inDialogMode={true}
                  externalFilters={savedFilters}
                  onFilterChange={setSavedFilters}
                />
              </div>
            )}
            
            {activeOption === 'group' && modules.grouping && (
              <div className="max-h-[400px] overflow-y-auto">
                <CustomGrouping 
                  ref={groupingRef} 
                  columns={columns} 
                  gridRef={gridRef}
                  inDialogMode={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop mode - regular popovers
  return (
    <div className="flex items-center gap-2">
      {modules.columns && (
        <>
          <ColumnReorderPopover 
            columns={columns.map((col, index) => ({
              id: index + 1,
              index,
              name: col.headerName || "",
              identifier: col.field || col.colId || col.headerName || '',
              visible: true
            }))} 
            gridRef={gridRef} 
          />
          <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />
        </>
      )}

      {modules.grouping && (
        <>
          <CustomGrouping ref={groupingRef} columns={columns} gridRef={gridRef} />
          <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />
        </>
      )}
      
      {modules.filters && (
        <>
          <CustomFilter 
            columns={columns} 
            gridRef={gridRef} 
            externalFilters={savedFilters}
            onFilterChange={setSavedFilters}
          />
          <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />
        </>
      )}
      
      {modules.sorting && (
        <CustomSorting ref={sortingRef} columns={columns} gridRef={gridRef} />
      )}
    </div>
  );
};

export default TableOptions;