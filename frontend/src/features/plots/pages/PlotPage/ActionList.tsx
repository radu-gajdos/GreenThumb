/**
 * ActionsList.tsx
 *
 * Renders a list of action cards with edit/delete functionality.  
 * If there are no actions, displays a placeholder message.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { IAction } from '../../interfaces/plot';
import ActionItem from './ActionItems';

interface ActionsListProps {
  /** Array of IAction objects to display */
  actions: IAction[];
  /** Callback for editing an action - same as table onEdit */
  onEdit: (actionId: string) => void;
  /** Callback for deleting an action - same as table onDelete */
  onDelete: (actionId: string) => void;
}

/**
 * ActionsList
 *
 * A component that:
 *  1. Shows a "no activities" message when the list is empty.
 *  2. Otherwise, maps each action to an <ActionItem> with edit/delete functionality.
 */
const ActionsList: React.FC<ActionsListProps> = ({ actions, onEdit, onDelete }) => {
  const { t } = useTranslation();

  // Early return for the empty state
  if (actions.length === 0) {
    return (
      <p className="text-gray-500 italic">
        {t('actionsList.noActivities')}
      </p>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {actions.map((action) => (
        // Each action rendered as its own card with edit/delete buttons
        <ActionItem 
          key={action.id} 
          action={action} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ActionsList;