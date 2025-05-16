import React from 'react';
import { castAction } from '../../api/plot.api';
import {
  IAction,
  IPlanting,
  IHarvesting,
  IFertilizing,
  ITreatment,
  IWatering,
  ISoilReading,
} from '../../interfaces/plot';

interface ActionItemProps {
  /** The generic action object to render; will be narrowed via `castAction`. */
  action: IAction;
}

/**
 * ActionItem
 *
 * Renders a styled “card” for an agricultural action (planting, harvesting, etc.).
 * It:
 * 1. Casts the generic `IAction` to its specific subtype.
 * 2. Chooses an icon, title, and color based on `action.type`.
 * 3. Displays the relevant fields for that action.
 */
const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  // Narrow the generic action into its specific interface
  const typedAction = castAction(action);

  /**
   * Formats a Date or date-string into 'MMM dd, yyyy' in en-US locale.
   * @param date - A Date object or date-string
   */
  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  /**
   * Returns the JSX for the action-specific details.
   */
  const renderActionContent = () => {
    switch (action.type) {
      case 'planting': {
        const planting = typedAction as IPlanting;
        return (
          <div>
            <p>
              <span className="font-medium">Crop:</span> {planting.cropType}
            </p>
            {planting.variety && (
              <p>
                <span className="font-medium">Variety:</span> {planting.variety}
              </p>
            )}
            {planting.seedingRate && (
              <p>
                <span className="font-medium">Seeding Rate:</span> {planting.seedingRate}
              </p>
            )}
            <p>
              <span className="font-medium">Date:</span> {formatDate(planting.plantingDate)}
            </p>
          </div>
        );
      }

      case 'harvesting': {
        const harvesting = typedAction as IHarvesting;
        return (
          <div>
            <p>
              <span className="font-medium">Yield:</span> {harvesting.cropYield} tons
            </p>
            <p>
              <span className="font-medium">Date:</span> {formatDate(harvesting.harvestDate)}
            </p>
            {harvesting.comments && (
              <p>
                <span className="font-medium">Comments:</span> {harvesting.comments}
              </p>
            )}
          </div>
        );
      }

      case 'fertilizing': {
        const fert = typedAction as IFertilizing;
        return (
          <div>
            <p>
              <span className="font-medium">Fertilizer:</span> {fert.fertilizerType}
            </p>
            <p>
              <span className="font-medium">Rate:</span> {fert.applicationRate} kg/ha
            </p>
            <p>
              <span className="font-medium">Method:</span> {fert.method}
            </p>
          </div>
        );
      }

      case 'treatment': {
        const treat = typedAction as ITreatment;
        return (
          <div>
            <p>
              <span className="font-medium">Pesticide:</span> {treat.pesticideType}
            </p>
            <p>
              <span className="font-medium">Target Pest:</span> {treat.targetPest}
            </p>
            <p>
              <span className="font-medium">Dosage:</span> {treat.dosage} l/ha
            </p>
            <p>
              <span className="font-medium">Method:</span> {treat.applicationMethod}
            </p>
          </div>
        );
      }

      case 'watering': {
        const water = typedAction as IWatering;
        return (
          <div>
            <p>
              <span className="font-medium">Method:</span> {water.method}
            </p>
            {water.amount && (
              <p>
                <span className="font-medium">Amount:</span> {water.amount} mm
              </p>
            )}
            {water.waterSource && (
              <p>
                <span className="font-medium">Source:</span> {water.waterSource}
              </p>
            )}
          </div>
        );
      }

      case 'soil_reading': {
        const soil = typedAction as ISoilReading;
        return (
          <div>
            <p>
              <span className="font-medium">pH:</span> {soil.ph}
            </p>
            {soil.nitrogen !== undefined && (
              <p>
                <span className="font-medium">Nitrogen:</span> {soil.nitrogen} mg/kg
              </p>
            )}
            {soil.phosphorus !== undefined && (
              <p>
                <span className="font-medium">Phosphorus:</span> {soil.phosphorus} mg/kg
              </p>
            )}
            {soil.potassium !== undefined && (
              <p>
                <span className="font-medium">Potassium:</span> {soil.potassium} mg/kg
              </p>
            )}
            {soil.organicMatter && (
              <p>
                <span className="font-medium">Organic Matter:</span> {soil.organicMatter}
              </p>
            )}
          </div>
        );
      }

      default:
        // Fallback if a new type is added but not handled
        return <p>Unknown action type</p>;
    }
  };

  /**
   * Maps action types to emoji icons.
   */
  const getActionIcon = () => {
    switch (action.type) {
      case 'planting':
        return '🌱';
      case 'harvesting':
        return '🚜';
      case 'fertilizing':
        return '💩';
      case 'treatment':
        return '🧪';
      case 'watering':
        return '💧';
      case 'soil_reading':
        return '🧪';
      default:
        return '📋';
    }
  };

  /**
   * Maps action types to tailwind color classes.
   */
  const getActionColor = () => {
    switch (action.type) {
      case 'planting':
        return 'bg-green-100 border-green-300';
      case 'harvesting':
        return 'bg-yellow-100 border-yellow-300';
      case 'fertilizing':
        return 'bg-amber-100 border-amber-300';
      case 'treatment':
        return 'bg-red-100 border-red-300';
      case 'watering':
        return 'bg-blue-100 border-blue-300';
      case 'soil_reading':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  /**
   * Human-readable title for each action type.
   */
  const getActionTitle = () => {
    switch (action.type) {
      case 'planting':
        return 'Planting';
      case 'harvesting':
        return 'Harvesting';
      case 'fertilizing':
        return 'Fertilizing';
      case 'treatment':
        return 'Treatment';
      case 'watering':
        return 'Watering';
      case 'soil_reading':
        return 'Soil Reading';
      default:
        // Capitalize unknown type
        return action.type.charAt(0).toUpperCase() + action.type.slice(1);
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getActionColor()}`}>
      <div className="flex items-center mb-3">
        {/* Icon representing the action */}
        <div className="text-2xl mr-2">{getActionIcon()}</div>
        {/* Title, e.g. "Planting" */}
        <h3 className="text-lg font-semibold">{getActionTitle()}</h3>
      </div>

      {/* Details section, indented with a left border */}
      <div className="pl-2 border-l-2 border-gray-300">
        {renderActionContent()}
      </div>
    </div>
  );
};

export default ActionItem;
