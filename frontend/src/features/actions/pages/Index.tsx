import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Action } from '../interfaces/action';
import AgGridTable from '@/components/table/AgGridTable';
import {
    getColumns,
    gridOptions,
    pagination,
    paginationPageSize,
    paginationPageSizeSelector,
} from '../constants/table';
import ActionModalForm from './ModalForm';
import ModalDelete from '@/components/modals/ModalDelete';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ActionApi } from '../api/action.api';

/**
 * @component Index
 * @description
 * Main listing page for actions. Displays an AG Grid table with
 * pagination, and supports creating, editing, and deleting actions
 * via modals.
 */
const Index: React.FC<{ 
    plotId: string, 
    actions: Action[],
    onActionAdded?: (action: Action) => void,
    onActionUpdated?: (action: Action) => void,
    onActionDeleted?: (id: string) => void
}> = ({ 
    plotId, 
    actions,
    onActionAdded,
    onActionUpdated,
    onActionDeleted
}) => {
    // Memoized API instance to avoid re-instantiating on every render
    const actionApi = useMemo(() => new ActionApi(), []);
    // ID of the action currently being edited or deleted
    const [uidToEdit, setUidToEdit] = useState<string | null>(null);
    // Control modal visibility
    const [showModalForm, setShowModalForm] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    // Selected action type for creation
    const [actionType, setActionType] = useState<string | null>(null);
    // Local copy of actions for immediate UI updates
    const [localActions, setLocalActions] = useState<Action[]>(actions);
    
    // Update local actions when prop changes
    React.useEffect(() => {
        setLocalActions(actions);
    }, [actions]);

    /**
     * Open edit modal for given action ID
     * @param uid - Action ID to edit
     */
    const onEdit = useCallback((uid: string) => {
        setUidToEdit(uid);
        // Determine action type for proper form rendering
        const action = localActions.find(a => a.id === uid);
        if (action) {
            setActionType(action.type);
        }
        setShowModalForm(true);
    }, [localActions]);

    /**
     * Open delete confirmation for given action ID
     * @param uid - Action ID to delete
     */
    const onDelete = useCallback((uid: string) => {
        setUidToEdit(uid);
        setDeleteModal(true);
    }, []);

    /**
     * Handle confirming deletion of the selected action.
     * Calls API and notifies parent via callback.
     */
    const handleDelete = useCallback(async () => {
        // Find the action object by ID
        const action = localActions.find((a) => a.id === uidToEdit);
        if (action) {
            await actionApi.delete(action.id);
            
            // Update local state immediately
            setLocalActions(prev => prev.filter(a => a.id !== action.id));
            
            // Notify parent component
            if (onActionDeleted) {
                onActionDeleted(action.id);
            }
        }
        // Reset deletion state
        setDeleteModal(false);
        setUidToEdit(null);
    }, [localActions, uidToEdit, actionApi, onActionDeleted]);

    /**
     * Handle saving (create or update) an action from the modal form.
     * Updates local state and notifies parent component via callbacks.
     * @param action - The saved Action object
     */
    const onSave = useCallback((action: Action) => {
        const isUpdate = localActions.some(a => a.id === action.id);
        
        // Update local state immediately for a responsive UI
        if (isUpdate) {
            setLocalActions(prev => 
                prev.map(a => a.id === action.id ? action : a)
            );
            
            // Notify parent component
            if (onActionUpdated) {
                onActionUpdated(action);
            }
        } else {
            // Add to local state
            setLocalActions(prev => [action, ...prev]);
            
            // Notify parent component
            if (onActionAdded) {
                onActionAdded(action);
            }
        }
        
        // Close modal
        setShowModalForm(false);
    }, [localActions, onActionAdded, onActionUpdated]);

    // Column definitions for AG Grid, memoized for performance
    const columns = useMemo(
        () => getColumns(onEdit, onDelete),
        [onEdit, onDelete]
    );

    return (
        <>
            {/* AG Grid table with toolbar dropdown button */}
            <AgGridTable<Action>
                data={localActions}
                loading={false}
                columns={columns}
                title="Acțiuni"
                pagination={pagination}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
                gridOptions={gridOptions}
                createButton={
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                setUidToEdit(null);
                                setShowModalForm(true);
                                setActionType(null); // Will show type selection in modal
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
                            Adaugă acțiune
                        </Button>
                    </div>
                }
            />

            {/* Delete confirmation modal */}
            <ModalDelete
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                confirmText="Sigur doriți să ștergeți această acțiune?"
            />

            {/* Create/Edit form modal */}
            <ActionModalForm
                showModal={showModalForm}
                setShowModal={setShowModalForm}
                onSave={onSave}
                uid={uidToEdit}
                plotId={plotId}
            />
        </>
    );
};

export default Index;