/**
 * PlotDetails.tsx
 *
 * Displays detailed information for a single plot, including:
 *  - Plot name & size
 *  - Interactive map of the boundary
 *  - Metadata cards (soil, topography, owner, created date)
 *  - Activity log with counts and individual actions
 *  - “Add Action” button that opens a modal form
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlotMap from './PlotMap';
import { Plot, IAction } from '../../interfaces/plot';
import ActionsList from './ActionList';
import { Button } from '@/components/ui/button';
import ModalForm from '@/features/actions/pages/ModalForm';

interface PlotDetailsProps {
  /** The plot object to render details for */
  plot: Plot;
}

const PlotDetails: React.FC<PlotDetailsProps> = ({ plot }) => {
  const { t, i18n } = useTranslation();
  
  /** Local copy of plot.actions so we can append new actions client-side */
  const [actionsState, setActionsState] = useState<IAction[]>(plot.actions);
  /** Controls visibility of the “Add Action” modal */
  const [showActionModal, setShowActionModal] = useState(false);

  /**
   * Sync local actionsState if parent plot.actions changes.
   * This handles updates from upstream (e.g. via props).
   */
  useEffect(() => {
    setActionsState(plot.actions);
  }, [plot.actions]);

  /**
   * Compute counts of each action type for badges.
   * useMemo ensures we only recalc when actionsState changes.
   */
  const actionGroups = useMemo(() => {
    return actionsState.reduce<Record<string, number>>((groups, action) => {
      groups[action.type] = (groups[action.type] || 0) + 1;
      return groups;
    }, {});
  }, [actionsState]);

  /**
   * Handler invoked when ModalForm saves a new action.
   * Appends to local state and closes the modal.
   * @param newAction - The ActionFormType returned by the form
   */
  const handleAddAction = (newAction: any) => {
    setActionsState((prev) => [...prev, newAction]);
    setShowActionModal(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header: plot name and area badge */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{plot.name}</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {plot.size.toFixed(2)} {t('plotDetails.hectares')}
        </div>
      </div>

      {/* Interactive map of the plot boundary */}
      <div className="mb-6">
        <PlotMap boundary={plot.boundary} />
      </div>

      {/* Metadata grid: soil type, topography, owner, created date */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('plotDetails.soilType')}</h3>
          <p className="text-gray-900">
            {plot.soilType || t('plotDetails.notSpecified')}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('plotDetails.topography')}</h3>
          <p className="text-gray-900">
            {plot.topography || t('plotDetails.notSpecified')}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('plotDetails.owner')}</h3>
          <p className="text-gray-900">
            {plot.owner?.name || t('plotDetails.notAvailable')}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('plotDetails.created')}</h3>
          <p className="text-gray-900">
            {new Date(plot.createdAt).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Activity Log section with counts and add button */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('plotDetails.activityLog')}</h2>
          <div className="flex items-center space-x-2">
            {/* “Add Action” opens the modal form */}
            <Button size="sm" onClick={() => setShowActionModal(true)}>
              {t('plotDetails.addAction')}
            </Button>
          </div>
        </div>

        {/* Badges showing counts per action type */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(actionGroups).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
            >
              {t(`plotDetails.actionTypes.${type}`)}: {count}
            </span>
          ))}
        </div>

        {/* List of individual actions */}
        <ActionsList actions={actionsState} />

        {/* Modal for creating a new action */}
        <ModalForm
          showModal={showActionModal}
          setShowModal={setShowActionModal}
          onSave={handleAddAction}
          plotId={plot.id}
        />
      </div>
    </div>
  );
};

export default PlotDetails;
