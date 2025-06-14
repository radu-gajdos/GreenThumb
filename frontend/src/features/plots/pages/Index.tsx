import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Plot } from '../interfaces/plot';
import AgGridTable from '@/components/table/AgGridTable';
import {
    getColumns,
    gridOptions,
    pagination,
    paginationPageSize,
    paginationPageSizeSelector,
} from '../constants/table';
import ModalForm from './ModalForm';
import ModalDelete from '@/components/modals/ModalDelete';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlotApi } from '../api/plot.api';
import PlotViewModal from './PlotPage/PlotViewModal';

/**
 * @component Index
 * @description
 * Main listing page for plots. Displays an AG Grid table with
 * pagination, and supports creating, editing, and deleting plots
 * via modals. Also supports viewing plot details in a modal overlay.
 */
const Index: React.FC = () => {
    const { t } = useTranslation();

    // State for fetched plots
    const [plots, setPlots] = useState<Plot[]>([]);
    // Loading indicator for data fetch
    const [loading, setLoading] = useState<boolean>(true);
    // Memoized API instance to avoid re-instantiating on every render
    const plotApi = useMemo(() => new PlotApi(), []);
    // ID of the plot currently being edited or deleted
    const [uidToEdit, setUidToEdit] = useState<string | null>(null);
    // ID of the plot currently being viewed
    const [uidToView, setUidToView] = useState<string | null>(null);
    // Control modal visibility
    const [showModalForm, setShowModalForm] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);

    /**
     * Fetch all plots from the server.
     * Wrapped in useCallback to avoid recreating the function.
     */
    const fetchPlots = useCallback(async () => {
        setLoading(true);
        const data = await plotApi.findAll();
        setPlots(data);
        setLoading(false);
    }, [plotApi]);

    // On mount, fetch plot data
    useEffect(() => {
        fetchPlots();
    }, [fetchPlots]);

    /**
     * Open edit modal for given plot ID
     * @param uid - Plot ID to edit
     */
    const onEdit = useCallback((uid: string) => {
        setUidToEdit(uid);
        setShowModalForm(true);
    }, []);

    /**
     * Open delete confirmation for given plot ID
     * @param uid - Plot ID to delete
     */
    const onDelete = useCallback((uid: string) => {
        setUidToEdit(uid);
        setDeleteModal(true);
    }, []);

    /**
     * Open view modal for given plot ID
     * @param uid - Plot ID to view
     */
    const onNameClick = useCallback((uid: string) => {
        setUidToView(uid);
        setShowViewModal(true);
    }, []);

    /**
     * Handle confirming deletion of the selected plot.
     * Calls API and removes from local state.
     */
    const handleDelete = useCallback(async () => {
        // Find the plot object by ID
        const plot = plots.find((p) => p.id === uidToEdit);
        if (plot) {
            await plotApi.delete(plot.id);
            // Remove from state so UI updates immediately
            setPlots((prev) => prev.filter((p) => p.id !== plot.id));
        }
        // Reset deletion state
        setDeleteModal(false);
        setUidToEdit(null);
    }, [plots, uidToEdit, plotApi]);

    /**
     * Handle saving (create or update) a plot from the modal form.
     * Inserts new plots at the top, or replaces existing.
     * @param plot - The saved Plot object
     */
    const onSave = useCallback((plot: Plot) => {
        setPlots((prev) =>
            prev.find((p) => p.id === plot.id)
                ? prev.map((p) => (p.id === plot.id ? plot : p))
                : [plot, ...prev]
        );
    }, []);

    /**
     * Close the view modal and reset the view ID
     */
    const closeViewModal = useCallback(() => {
        setShowViewModal(false);
        setUidToView(null);
    }, []);

    // Column definitions for AG Grid, memoized for performance
    const columns = useMemo(
        () => getColumns(onEdit, onDelete, onNameClick),
        [onEdit, onDelete, onNameClick]
    );

    // Render plot view modal if it's open, otherwise render the main table
    if (showViewModal) {
        return (
            <>
                <PlotViewModal
                    isOpen={showViewModal}
                    onClose={closeViewModal}
                    plotId={uidToView}
                />
                
                {/* Keep other modals available even in view mode */}
                <ModalDelete
                    isOpen={deleteModal}
                    onClose={() => setDeleteModal(false)}
                    onConfirm={handleDelete}
                    confirmText={t('plotsIndex.deleteConfirm')}
                />

                <ModalForm
                    showModal={showModalForm}
                    setShowModal={setShowModalForm}
                    onSave={onSave}
                    uid={uidToEdit}
                />
            </>
        );
    }

    return (
        <>
            {/* AG Grid table with toolbar button */}
            <AgGridTable<Plot>
                data={plots}
                loading={loading}
                columns={columns}
                title={t('plotsIndex.title')}
                pagination={pagination}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
                gridOptions={gridOptions}
                context={{ onNameClick }}
                createButton={
                    <Button
                        onClick={() => {
                            setUidToEdit(null);
                            setShowModalForm(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
                        {t('plotsIndex.addPlot')}
                    </Button>
                }
            />

            {/* Delete confirmation modal */}
            <ModalDelete
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                confirmText={t('plotsIndex.deleteConfirm')}
            />

            {/* Create/Edit form modal */}
            <ModalForm
                showModal={showModalForm}
                setShowModal={setShowModalForm}
                onSave={onSave}
                uid={uidToEdit}
            />
        </>
    );
};

export default Index;