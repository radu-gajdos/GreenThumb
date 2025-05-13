import React, { useState, useRef, useCallback, useEffect } from 'react';
import TableSkeleton from './TableSkeleton';
import { Plus, ListFilterPlus, TableProperties, Search } from 'lucide-react';
import { wingoTheme } from '@/lib/utils';
import { AgGridReact } from 'ag-grid-react';
import { ColDefType } from './modules/interfaces/ColDefType';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import TableOptions from './modules/options/TableOptions';
import { CustomNoRowsOverlay } from './modules/overlays/CustomNoRowsOverlay';
import { ClientSideRowModelModule, ColumnsToolPanelModule, ModuleRegistry } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule]);

// Define a type for the compact component props
interface CompactComponentProps<T> {
    rows: T[];
}

interface AgGridTableProps<T> {
    loading: boolean;
    columns: ColDefType<T>[];
    data: T[];
    title: string;
    createButton: React.ReactNode | React.ReactNode[];
    compactComponent?: React.ReactElement<CompactComponentProps<T>>; // Typed with the expected props
    activeRowId?: string | null;
    [key: string]: any; // Allow for additional properties
}

const AgGridTable = <T extends { id?: string },>({
    loading,
    columns,
    data,
    title,
    createButton,
    compactComponent,
    activeRowId,
    modules = { columns: true, sorting: true, filters: true, grouping: true }, // Default - show all modules
    ...props
}: AgGridTableProps<T>) => {
    const [gridReady, setGridReady] = useState<boolean>(false);
    const [isCompact, setIsCompact] = useState<boolean>(false);
    const [processedRows, setProcessedRows] = useState<T[]>([]); // State for filtered/sorted rows
    const gridRef = useRef<AgGridReact<T>>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tableOptionsOpen, setTableOptionsOpen] = useState<boolean>(false);

    useEffect(() => {
        const checkWidth = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.getBoundingClientRect().width;
                setIsCompact(containerWidth < 768); // Using a standard breakpoint for tablet/mobile
            }
        };

        // Check initial width
        checkWidth();

        // Use ResizeObserver to detect container size changes
        const resizeObserver = new ResizeObserver(checkWidth);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
            resizeObserver.disconnect();
        };
    }, [containerRef.current]);

    const getRowsForCompact = useCallback(() => {
        if (gridRef.current && gridRef.current.api) {
            let rowData: any[] = [];
            gridRef.current.api.forEachNodeAfterFilter(node => {
                rowData.push(node.data);
            });
            setProcessedRows(rowData);
        }
    }, [gridRef]);

    useEffect(() => {
        if (gridRef.current && isCompact) {
            if (gridRef.current.api) {
                gridRef.current.api.addEventListener('filterChanged', getRowsForCompact);
                gridRef.current.api.addEventListener('sortChanged', getRowsForCompact);
            }
            getRowsForCompact();
        }
    }, [isCompact, gridRef.current, getRowsForCompact]);

    // Initialize processed rows with the original data
    useEffect(() => {
        setProcessedRows(data);
    }, [data]);

    // Show no rows overlay when data is empty
    useEffect(() => {
        if (gridRef.current && gridRef.current.api && gridReady) {
            if (data.length === 0) {
                gridRef.current.api.showNoRowsOverlay();
            } else {
                gridRef.current.api.hideOverlay();
            }
        }
    }, [data, gridReady]);

    const onGridReady = useCallback(() => {
        setGridReady(true);
        // Initialize processed rows when grid is ready
        getRowsForCompact();
    }, [getRowsForCompact]);

    if (loading) {
        return <TableSkeleton />;
    }

    const handleCreateButtonClick = () => {
        if (React.isValidElement(createButton) && createButton.props.onClick) {
            createButton.props.onClick();
        }
    };
    

    return (
        <div ref={containerRef} className="w-full h-full">
            <div className={`overflow-x-auto items-center justify bg-white dark:bg-gray-900 border-b dark:border-gray-600 ${isCompact ? 'grid' : 'flex p-3'}`}>
                <div className={`items-center ${isCompact ? 'grid gap-1 max-w-[100vw] sm:px-4 sm:py-3 p-2' : 'flex flex-1 gap-6'}`}>
                    <div className="flex items-center gap-2">
                        {!isCompact && <TableProperties className="w-4 h-4 dark:text-gray-300" />}
                        <span className={`font-medium ${isCompact ? 'pl-0.5' : 'text-sm'} dark:text-white`}>{title}</span>
                    </div>
                    <div className="flex items-center gap-6 tableOptions">
                        {gridReady && (
                            <>
                                <div className={`flex items-center relative ${isCompact && 'flex-1'}`}>
                                    {
                                        !isCompact && <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    }
                                    <Input
                                        type="search"
                                        placeholder="Caută în tabel..."
                                        className={`${isCompact ? 'w-full h-9' : 'pl-8 h-9 md:w-[150px] lg:w-[230px]'}`}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            gridRef.current!.api.setGridOption("quickFilterText", value);
                                        }}
                                    />

                                    <div className='flex'>
                                        {isCompact &&
                                            <>
                                                <Button variant="outline" size="sm" className="h-10 w-10 px-2 ml-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" onClick={handleCreateButtonClick}>
                                                    <Plus className="w-4 h-4 dark:text-gray-300" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-10 w-10 px-2 ml-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" onClick={() => setTableOptionsOpen(true)}>
                                                    <ListFilterPlus className="w-4 h-4 dark:text-gray-300" />
                                                </Button>
                                            </>
                                        }
                                    </div>
                                </div>

                                {!isCompact && (
                                    <div className="flex items-center gap-2">
                                        {/* Use the new TableOptions component for desktop */}
                                        <TableOptions
                                            gridRef={gridRef}
                                            columns={columns}
                                            isCompact={false}
                                            modules={modules}
                                        />
                                    </div>
                                )}

                                {/* Use the TableOptions component in dialog mode for mobile */}
                                {isCompact && (
                                    <TableOptions
                                        gridRef={gridRef}
                                        columns={columns}
                                        isCompact={true}
                                        tableOptionsOpen={tableOptionsOpen}
                                        setTableOptionsOpen={setTableOptionsOpen}
                                        modules={modules}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
                {!isCompact && (
                    <div className="mr-2 flex gap-2 items-center">
                        {Array.isArray(createButton) ? createButton.map((btn, i) => (
                            <div key={i}>{btn}</div>
                        )) : createButton}
                    </div>
                )}

            </div>

            <div className={`overflow-x-auto ${isCompact ? 'p-0' : 'p-2 sm:p-4'}`}>
                {isCompact && compactComponent &&
                    React.cloneElement(compactComponent, { rows: processedRows })
                }
                <div className={`${isCompact && compactComponent ? 'hidden' : ''}`}>
                    <AgGridReact
                        ref={gridRef}
                        theme={wingoTheme}
                        className={`tabel-agGrid !h-full`}
                        columnDefs={columns.map(col => { const { icon, dataType, ...rest } = col; return rest; })}
                        rowData={data}
                        defaultColDef={{ flex: 1, minWidth: 20 }}
                        domLayout='autoHeight'
                        groupDisplayType={"groupRows"}
                        rowClassRules={{
                            'bg-primary-50': (params) => activeRowId !== null && params.data?.id === activeRowId,
                        }}
                        {...props}
                        enableCharts={true}
                        onGridReady={onGridReady}
                        components={{
                            customNoRowsOverlay: CustomNoRowsOverlay,
                        }}
                        noRowsOverlayComponent="customNoRowsOverlay"
                        noRowsOverlayComponentParams={{
                            createButton,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgGridTable;