import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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
import {
  Sprout,
  Tractor,
  Wind,
  Droplets,
  FlaskConical,
  FileText,
  PillBottle
} from 'lucide-react';
import { formatDateTime } from '@/lib/formatDateTime';

interface ActionItemProps {
  /** The generic action object to render; will be narrowed via `castAction`. */
  action: IAction;
  /** Callback for editing the action - same as table onEdit */
  onEdit: (actionId: string) => void;
  /** Callback for deleting the action - same as table onDelete */
  onDelete: (actionId: string) => void;
}

/**
 * ActionItem
 *
 * Renders a styled "card" for an agricultural action with integrated Edit/Delete buttons.
 * Same functionality as the AG Grid table actions.
 */
const ActionItem: React.FC<ActionItemProps> = ({ action, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();

  // Narrow the generic action into its specific interface
  const typedAction = castAction(action);

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
              <span className="font-medium">{t('actionItem.labels.crop')}</span> {planting.cropType}
            </p>
            {planting.variety && (
              <p>
                <span className="font-medium">{t('actionItem.labels.variety')}</span> {planting.variety}
              </p>
            )}
            {planting.seedingRate && (
              <p>
                <span className="font-medium">{t('actionItem.labels.seedingRate')}</span> {planting.seedingRate}
              </p>
            )}
            <p>
              <span className="font-medium">{t('actionItem.labels.date')}</span> {formatDateTime(planting.date)}
            </p>
          </div>
        );
      }

      case 'harvesting': {
        const harvesting = typedAction as IHarvesting;
        return (
          <div>
            <p>
              <span className="font-medium">{t('actionItem.labels.yield')}</span> {harvesting.cropYield}{' '}
              {t('actionItem.units.kgPerHa')}
            </p>
            <p>
              <span className="font-medium">{t('actionItem.labels.date')}</span> {formatDateTime(harvesting.date)}
            </p>
            {harvesting.comments && (
              <p>
                <span className="font-medium">{t('actionItem.labels.comments')}</span> {harvesting.comments}
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
              <span className="font-medium">{t('actionItem.labels.fertilizer')}</span> {fert.fertilizerType}
            </p>
            <p>
              <span className="font-medium">{t('actionItem.labels.rate')}</span> {fert.applicationRate}{' '}
              {t('actionItem.units.kgPerHa')}
            </p>
            {fert.method && (
              <p>
                <span className="font-medium">{t('actionItem.labels.method')}</span> {fert.method}
              </p>
            )}
            <p>
              <span className="font-medium">{t('actionItem.labels.date')}</span> {formatDateTime(fert.date)}
            </p>
          </div>
        );
      }

      case 'treatment': {
        const treat = typedAction as ITreatment;
        return (
          <div>
            <p>
              <span className="font-medium">{t('actionItem.labels.pesticide')}</span> {treat.pesticideType}
            </p>
            {treat.targetPest && (
              <p>
                <span className="font-medium">{t('actionItem.labels.targetPest')}</span> {treat.targetPest}
              </p>
            )}
            <p>
              <span className="font-medium">{t('actionItem.labels.dosage')}</span> {treat.dosage}{' '}
              {t('actionItem.units.lPerHa')}
            </p>
            {treat.applicationMethod && (
              <p>
                <span className="font-medium">{t('actionItem.labels.method')}</span> {treat.applicationMethod}
              </p>
            )}
            <p>
              <span className="font-medium">{t('actionItem.labels.date')}</span> {formatDateTime(treat.date)}
            </p>
          </div>
        );
      }

      case 'watering': {
        const water = typedAction as IWatering;
        return (
          <div>
            {water.method && (
              <p>
                <span className="font-medium">{t('actionItem.labels.method')}</span> {water.method}
              </p>
            )}
            {water.amount !== undefined && (
              <p>
                <span className="font-medium">{t('actionItem.labels.amount')}</span> {water.amount}{' '}
                {t('actionItem.units.mm')}
              </p>
            )}
            {water.waterSource && (
              <p>
                <span className="font-medium">{t('actionItem.labels.source')}</span> {water.waterSource}
              </p>
            )}
            <p>
              <span className="font-medium">{t('actionItem.labels.date')}</span> {formatDateTime(water.date)}
            </p>
          </div>
        );
      }

      case 'soil_reading': {
        const soil = typedAction as ISoilReading;
        return (
          <div>
            {soil.ph !== undefined && (
              <p>
                <span className="font-medium">{t('actionItem.labels.ph')}</span> {soil.ph}
              </p>
            )}
            {soil.nitrogen !== undefined && (
              <p>
                <span className="font-medium">{t('actionItem.labels.nitrogen')}</span> {soil.nitrogen}{' '}
                {t('actionItem.units.mgPerKg')}
              </p>
            )}
            {soil.phosphorus !== undefined && (
              <p>
                <span className="font-medium">{t('actionItem.labels.phosphorus')}</span> {soil.phosphorus}{' '}
                {t('actionItem.units.mgPerKg')}
              </p>
            )}
            {soil.potassium !== undefined && (
              <p>
                <span className="font-medium">{t('actionItem.labels.potassium')}</span> {soil.potassium}{' '}
                {t('actionItem.units.mgPerKg')}
              </p>
            )}
            {soil.organicMatter && (
              <p>
                <span className="font-medium">{t('actionItem.labels.organicMatter')}</span> {soil.organicMatter}
              </p>
            )}
            <p>
              <span className="font-medium">{t('actionItem.labels.date')}</span> {formatDateTime(soil.date)}
            </p>
          </div>
        );
      }

      default:
        return <p>{t('actionItem.unknownType')}</p>;
    }
  };

  /**
   * Returns the Lucide icon component for each action type.
   */
  const getActionIcon = () => {
    switch (action.type) {
      case 'planting':
        return <Sprout className="text-green-600" />;
      case 'harvesting':
        return <Tractor className="text-yellow-600" />;
      case 'fertilizing':
        return <Wind className="text-amber-600" />;
      case 'treatment':
        return <PillBottle className="text-red-600" />;
      case 'watering':
        return <Droplets className="text-blue-600" />;
      case 'soil_reading':
        return <FlaskConical className="text-purple-600" />;
      default:
        return <FileText className="text-gray-600" />;
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
    return t(`actionItem.types.${action.type}`);
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getActionColor()} relative`}>
      {/* Header with title and action buttons */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {/* Icon representing the action */}
          <div className="mr-2">{getActionIcon()}</div>
          {/* Title, e.g. "Planting" */}
          <h3 className="text-lg font-semibold">{getActionTitle()}</h3>
        </div>

        {/* Action buttons - same as table functionality */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(action.id)}
            className="h-8 w-8 p-0 hover:bg-blue-100"
            title={t('actionItem.buttons.edit')}
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(action.id)}
            className="h-8 w-8 p-0 hover:bg-red-100"
            title={t('actionItem.buttons.delete')}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Details section, indented with a left border */}
      <div className="pl-2 border-l-2 border-gray-300">
        {renderActionContent()}
      </div>
    </div>
  );
};

export default ActionItem;