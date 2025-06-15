/**
 * PlotDetails.tsx
 *
 * Displays detailed information for a single plot, including:
 *  - Interactive map of the boundary with size badge
 *  - Metadata cards (soil, topography, owner)
 *  - Activity log with counts and individual actions
 *  - "Add Action" button that opens a modal form
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlotMap from './PlotMap';
import { Plot } from '../../interfaces/plot';
import ActionsList from './ActionList';
import { Button } from '@/components/ui/button';
import ModalForm from '@/features/actions/pages/ModalForm';
import ActionsIndex from '@/features/actions/pages/Index';
import ModalDelete from '@/components/modals/ModalDelete';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Action } from '@/features/actions/interfaces/action';
import { ActionApi } from '@/features/actions/api/action.api';
import { MapPin, Layers, User, Map } from 'lucide-react';
import { formatDate } from '@/lib/formatDateTime';

interface PlotDetailsProps {
  /** The plot object to render details for */
  plot: Plot;
  /** Optional callback when actions change to notify parent components */
  onActionsChange?: (actions: Action[]) => void;
}

const PlotDetails: React.FC<PlotDetailsProps> = ({ plot, onActionsChange }) => {
  const { t } = useTranslation();

  /** Local copy of plot.actions so we can append new actions client-side */
  const [actionsState, setActionsState] = useState<Action[]>(plot.actions);
  /** Controls visibility of the "Add Action" modal */
  const [showActionModal, setShowActionModal] = useState(false);
  /** Controls visibility of the "Actions Index" modal */
  const [showActionsIndex, setShowActionsIndex] = useState(false);
  /** ID of the action currently being edited or deleted */
  const [uidToEdit, setUidToEdit] = useState<string | null>(null);
  /** Controls visibility of the delete confirmation modal */
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /** Memoized API instance */
  const actionApi = useMemo(() => new ActionApi(), []);

  /**
   * Sync local actionsState if parent plot.actions changes.
   * This handles updates from upstream (e.g. via props).
   */
  useEffect(() => {
    setActionsState(plot.actions);
  }, [plot.actions]);

  /**
   * Notify parent when our actions change
   */
  useEffect(() => {
    if (onActionsChange) {
      onActionsChange(actionsState);
    }
  }, [actionsState, onActionsChange]);

  /**
   * Open edit modal for given action ID - same logic as in Index
   */
  const onEdit = useCallback((uid: string) => {
    setUidToEdit(uid);
    setShowActionModal(true);
  }, []);

  /**
   * Open delete confirmation for given action ID - same logic as in Index
   */
  const onDelete = useCallback((uid: string) => {
    setUidToEdit(uid);
    setShowDeleteModal(true);
  }, []);

  /**
   * Handle confirming deletion - same logic as in Index
   */
  const handleDelete = useCallback(async () => {
    if (uidToEdit) {
      try {
        // Call API to delete
        await actionApi.delete(uidToEdit);
        
        // Update local state immediately
        setActionsState(prev => prev.filter(a => a.id !== uidToEdit));
      } catch (error) {
        console.error('Failed to delete action:', error);
      }
    }
    
    // Reset state
    setShowDeleteModal(false);
    setUidToEdit(null);
  }, [uidToEdit, actionApi]);

  /**
   * Handler for adding new action (create mode)
   */
  const handleAddAction = useCallback((newAction: Action) => {
    setActionsState((prev) => [newAction, ...prev]);
    setShowActionModal(false);
    setUidToEdit(null); // Reset after create
  }, []);

  /**
   * Handler for updating existing action (edit mode)
   */
  const handleUpdateAction = useCallback((updatedAction: Action) => {
    setActionsState(prev => 
      prev.map(a => a.id === updatedAction.id ? updatedAction : a)
    );
    setShowActionModal(false);
    setUidToEdit(null); // Reset after update
  }, []);

  /**
   * Combined handler for both create and update - passed to ModalForm
   */
  const handleSaveAction = useCallback((action: Action) => {
    if (uidToEdit) {
      // Edit mode
      handleUpdateAction(action);
    } else {
      // Create mode
      handleAddAction(action);
    }
  }, [uidToEdit, handleAddAction, handleUpdateAction]);

  /**
   * Handlers for the ActionsIndex component
   */
  const handleActionAdded = (action: Action) => {
    setActionsState(prev => {
      // Check if action already exists to avoid duplicates
      if (prev.some(a => a.id === action.id)) {
        return prev;
      }
      return [action, ...prev];
    });
  };

  const handleActionUpdated = (action: Action) => {
    setActionsState(prev =>
      prev.map(a => a.id === action.id ? action : a)
    );
  };

  const handleActionDeleted = (id: string) => {
    setActionsState(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Interactive map with size badge overlay */}
      <div className="relative">
        <PlotMap boundary={plot.boundary} />
        {/* Size badge positioned over the map */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-green-700 px-4 py-2 rounded-lg shadow-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span className="font-semibold">{plot.size.toFixed(2)} {t('plotDetails.hectares')}</span>
          </div>
        </div>
      </div>

      {/* Metadata cards in a single row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-amber-200 rounded-lg">
              <Layers className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="text-sm font-medium text-amber-800">{t('plotDetails.soilType')}</h3>
          </div>
          <p className="text-amber-900 font-medium">
            {plot.soilType || t('plotDetails.notSpecified')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-200 rounded-lg">
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-sm font-medium text-emerald-800">{t('plotDetails.topography')}</h3>
          </div>
          <p className="text-emerald-900 font-medium">
            {plot.topography || t('plotDetails.notSpecified')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-200 rounded-lg">
              <User className="w-4 h-4 text-blue-700" />
            </div>
            <h3 className="text-sm font-medium text-blue-800">{t('plotDetails.created')}</h3>
          </div>
          <p className="text-blue-900 font-medium">
            {formatDate(plot.createdAt) || t('plotDetails.notAvailable')}
          </p>
        </div>
      </div>

      {/* Activity Log section with counts and add button */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('plotDetails.activityLog')}</h2>
          <div className="flex items-center space-x-2">
            {/* "Add Action" opens the modal form */}
            <Button size="sm" onClick={() => {
              setUidToEdit(null); // Clear edit ID for create mode
              setShowActionModal(true);
            }}>
              {t('plotDetails.addAction')}
            </Button>
            {/* "View All Actions" opens the Actions Index */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowActionsIndex(true)}
            >
              {t('plotDetails.viewAllActions')}
            </Button>
          </div>
        </div>

        {/* List of individual actions with edit/delete functionality */}
        <ActionsList
          actions={actionsState}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Modal for creating/editing actions */}
      <ModalForm
        showModal={showActionModal}
        setShowModal={setShowActionModal}
        onSave={handleSaveAction}
        plotId={plot.id}
        uid={uidToEdit} // Pass uidToEdit for edit mode
      />

      {/* Delete confirmation modal */}
      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText={t('plotDetails.deleteActionConfirm')}
      />

      {/* Modal for browsing all actions */}
      <Dialog open={showActionsIndex} onOpenChange={setShowActionsIndex} modal>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t('plotDetails.allActions')} - {plot.name}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto">
            <ActionsIndex
              plotId={plot.id}
              actions={actionsState}
              onActionAdded={handleActionAdded}
              onActionUpdated={handleActionUpdated}
              onActionDeleted={handleActionDeleted}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionsIndex(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlotDetails;