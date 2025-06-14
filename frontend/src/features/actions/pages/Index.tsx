import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const actionApi = useMemo(() => new ActionApi(), []);
    const [uidToEdit, setUidToEdit] = useState<string | null>(null);
    const [showModalForm, setShowModalForm] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [actionType, setActionType] = useState<string | null>(null);
    const [localActions, setLocalActions] = useState<Action[]>(actions);
    
    React.useEffect(() => {
        setLocalActions(actions);
    }, [actions]);

    const onEdit = useCallback((uid: string) => {
        setUidToEdit(uid);
        const action = localActions.find(a => a.id === uid);
        if (action) {
            setActionType(action.type);
        }
        setShowModalForm(true);
    }, [localActions]);

    const onDelete = useCallback((uid: string) => {
        setUidToEdit(uid);
        setDeleteModal(true);
    }, []);

    const handleDelete = useCallback(async () => {
        const action = localActions.find((a) => a.id === uidToEdit);
        if (action) {
            await actionApi.delete(action.id);
            setLocalActions(prev => prev.filter(a => a.id !== action.id));
            if (onActionDeleted) {
                onActionDeleted(action.id);
            }
        }
        setDeleteModal(false);
        setUidToEdit(null);
    }, [localActions, uidToEdit, actionApi, onActionDeleted]);

    const onSave = useCallback((action: Action) => {
        const isUpdate = localActions.some(a => a.id === action.id);
        if (isUpdate) {
            setLocalActions(prev => 
                prev.map(a => a.id === action.id ? action : a)
            );
            if (onActionUpdated) {
                onActionUpdated(action);
            }
        } else {
            setLocalActions(prev => [action, ...prev]);
            if (onActionAdded) {
                onActionAdded(action);
            }
        }
        setShowModalForm(false);
    }, [localActions, onActionAdded, onActionUpdated]);

    const columns = useMemo(() => getColumns(onEdit, onDelete), [onEdit, onDelete]);

    return (
        <>
            <AgGridTable<Action>
                data={localActions}
                loading={false}
                columns={columns}
                title={t('actionIndex.title', { defaultValue: 'Acțiuni' })}
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
                            {t('actionIndex.addAction', { defaultValue: 'Adaugă acțiune' })}
                        </Button>
                    </div>
                }
            />

            <ModalDelete
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                confirmText={t('actionIndex.confirmDelete', {
                    defaultValue: 'Sigur doriți să ștergeți această acțiune?',
                })}
            />

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
