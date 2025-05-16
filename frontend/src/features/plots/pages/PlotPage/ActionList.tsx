import React, { useMemo } from 'react';
import { IAction } from '../../interfaces/plot';
import ActionItem from './ActionItems';

interface ActionsListProps {
  /** Array of action records to display in the log */
  actions: IAction[];
}

/**
 * ActionsList
 *
 * Renders an “Activity Log” of plot actions, grouped by type with counts,
 * followed by individual action cards.
 */
const ActionsList: React.FC<ActionsListProps> = ({ actions }) => {
  /**
   * Compute a map from action type → count.
   * Wrapped in useMemo so we only re-calc when `actions` changes.
   */
  const actionGroups = useMemo(() => {
    return actions.reduce<Record<string, number>>((groups, action) => {
      groups[action.type] = (groups[action.type] || 0) + 1;
      return groups;
    }, {});
  }, [actions]);

  return (
    <div className="mt-6">
      {/* Header with title and badges for each action type */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Activity Log</h2>
        <div className="flex space-x-2">
          {Object.entries(actionGroups).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
            >
              {/* e.g. "planting: 3" */}
              {type}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* List of individual action items or placeholder when empty */}
      <div className="space-y-4 mt-4">
        {actions.length > 0 ? (
          actions.map((action) => (
            <ActionItem key={action.id} action={action} />
          ))
        ) : (
          <p className="text-gray-500 italic">No activities recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ActionsList;
