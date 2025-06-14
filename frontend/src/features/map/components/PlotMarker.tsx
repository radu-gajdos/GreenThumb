import React from 'react';
import { Polygon, Tooltip, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { MapPin, Activity, Calendar, TrendingUp } from 'lucide-react';
import { Plot } from '@/features/plots/interfaces/plot';
import { useTranslation } from 'react-i18next';

interface PlotMarkerProps {
  plot: Plot;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onPlotClick?: (plot: Plot) => void;
  onPlotHover?: (plot: Plot | null) => void;
  showTooltip?: boolean;
  showPopup?: boolean;
  color?: string;
}

const PlotMarker: React.FC<PlotMarkerProps> = ({
  plot,
  isSelected = false,
  isHighlighted = false,
  onPlotClick,
  onPlotHover,
  showTooltip = true,
  showPopup = false,
  color
}) => {
  const { t } = useTranslation();

  const ring = plot.boundary.coordinates?.[0] || [];
  const positions = ring.map(([lng, lat]) => [lat, lng] as LatLngExpression);

  const getPolygonColor = () => {
    if (color) return color;
    if (isSelected) return '#3B82F6';
    if (isHighlighted) return '#F59E0B';
    return '#10B981';
  };

  const polygonOptions = {
    color: getPolygonColor(),
    weight: isSelected ? 3 : isHighlighted ? 2.5 : 2,
    fillOpacity: isSelected ? 0.3 : isHighlighted ? 0.25 : 0.2,
    opacity: 0.8,
  };

  const stats = {
    area: plot.size || 0,
  };

  return (
    <Polygon
      pathOptions={polygonOptions}
      positions={positions}
      eventHandlers={{
        click: () => onPlotClick?.(plot),
        mouseover: () => onPlotHover?.(plot),
        mouseout: () => onPlotHover?.(null),
      }}
    >
      {showTooltip && (
        <Tooltip direction="top" offset={[0, -10]} opacity={0.95} sticky className="map-plot-tooltip">
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-gray-900">{plot.name}</h4>
            </div>

            <div className="space-y-1 text-sm">
              {stats.area > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('plotMarker.area')}:</span>
                  <span className="font-medium text-gray-900">{stats.area.toFixed(2)} ha</span>
                </div>
              )}
              {plot.soilType && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('plotMarker.soil')}:</span>
                  <span className="font-medium text-gray-900 capitalize">{plot.soilType}</span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">{t('plotMarker.clickHint')}</p>
            </div>
          </div>
        </Tooltip>
      )}

      {showPopup && (
        <Popup closeButton={true} className="map-plot-popup">
          <div className="p-2 min-w-[250px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">{plot.name}</h3>
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getPolygonColor() }} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">{t('plotMarker.area')}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {stats.area.toFixed(2)} ha
                </p>
              </div>

              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <Activity className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">{t('plotMarker.status')}</span>
                </div>
                <p className="text-sm font-semibold text-green-600">{t('plotMarker.active')}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {plot.soilType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('plotMarker.soilType')}:</span>
                  <span className="font-medium capitalize">{plot.soilType}</span>
                </div>
              )}

              {plot.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('plotMarker.created')}:</span>
                  <span className="font-medium">
                    {new Date(plot.createdAt).toLocaleDateString('ro-RO')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-2">
              <button
                onClick={() => onPlotClick?.(plot)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
              >
                {t('plotMarker.viewDetails')}
              </button>
            </div>
          </div>
        </Popup>
      )}
    </Polygon>
  );
};

export default PlotMarker;
