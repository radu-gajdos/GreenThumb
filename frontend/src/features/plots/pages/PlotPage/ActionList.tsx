/**
 * ActionsList.tsx
 *
 * Renders a list of action cards.  
 * If there are no actions, displays a placeholder message.
 */

import React from 'react';
import { IAction } from '../../interfaces/plot';
import ActionItem from './ActionItems';

interface ActionsListProps {
  /** Array of IAction objects to display */
  actions: IAction[];
}

/**
 * ActionsList
 *
 * A simple component that:
 *  1. Shows a “no activities” message when the list is empty.
 *  2. Otherwise, maps each action to an <ActionItem>.
 */
const ActionsList: React.FC<ActionsListProps> = ({ actions }) => {
  // Early return for the empty state
  if (actions.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No activities recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {actions.map((action) => (
        // Each action rendered as its own card
        <ActionItem key={action.id} action={action} />
      ))}
    </div>
  );
};

export default ActionsList;
