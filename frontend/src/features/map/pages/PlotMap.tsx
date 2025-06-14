import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Plot } from '@/features/plots/interfaces/plot';
import MapControls, { MapLayerType } from '../components/MapControls';
import MapLoadingState from '../components/MapLoadingState';
import MapErrorState from '../components/MapErrorState';
import PlotMarker from '../components/PlotMarker';
import { useMapData } from '../hooks/useMapData';

/** Default fallback center (central Romania) */
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];

interface PlotMapProps {
  onPlotSelect?: (plot: Plot) => void;
  selectedPlotId?: string | null;
  showControls?: boolean;
  className?: string;
}

/** Adaugă bara de căutare pe hartă */
function SearchBar() {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const control = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      marker: { draggable: false },
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });
    
    map.addControl(control);
    return () => {
      map.removeControl(control);
    };
  }, [map]);
  
  return null;
}

/** Setează centrul hărții după montare */
function SetMapCenter({ center }: { center: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 17);
    }
  }, [map, center]);
  
  return null;
}

const PlotMap: React.FC<PlotMapProps> = ({ 
  onPlotSelect, 
  selectedPlotId,
  showControls = true,
  className = ""
}) => {
  const { t } = useTranslation();

  // Use custom hook for map data
  const {
    plots,
    mapCenter,
    loading,
    error,
    loadPlots,
    setMapCenter,
    calculateCenterFromPlots,
    totalArea,
    plotsCount,
    hasPlots,
  } = useMapData();

  // Local state
  const [currentLayer, setCurrentLayer] = useState<MapLayerType>('satellite');
  const [showPlots, setShowPlots] = useState(true);
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null);

  const handleResetView = () => {
    const center = calculateCenterFromPlots();
    if (center) {
      setMapCenter(center);
    }
  };

  const handlePlotClick = (plot: Plot) => {
    if (onPlotSelect) {
      onPlotSelect(plot);
    }
  };

  const handlePlotHover = (plot: Plot | null) => {
    setHoveredPlot(plot);
  };

  const handleExportMap = () => {
    // Implementează funcționalitatea de export
    console.log('Export map functionality');
  };

  const getTileLayerConfig = () => {
    switch (currentLayer) {
      case 'satellite':
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: t('plotMap.tileLayer.satellite.attribution')
        };
      case 'street':
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: t('plotMap.tileLayer.street.attribution')
        };
      case 'terrain':
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution: t('plotMap.tileLayer.terrain.attribution')
        };
      default:
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: t('plotMap.tileLayer.satellite.attribution')
        };
    }
  };

  const tileConfig = getTileLayerConfig();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t('plotMap.header.title')}
            </h3>
            <p className="text-sm text-gray-500">
              {hasPlots 
                ? t('plotMap.header.plotsFound', { count: plotsCount })
                : t('plotMap.header.searchingPlots')
              }
            </p>
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPlots(!showPlots)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                showPlots 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {showPlots 
                ? t('plotMap.controls.visible')
                : t('plotMap.controls.hidden')
              }
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-[500px]">
        {loading && <MapLoadingState />}
        {error && (
          <MapErrorState 
            error={error} 
            onRetry={loadPlots}
            errorType={error.includes('network') ? 'network' : 'data'}
          />
        )}
        
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={17}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            url={tileConfig.url}
            attribution={tileConfig.attribution}
          />
          
          <SearchBar />
          <SetMapCenter center={mapCenter} />
          
          {showPlots && plots.map((plot) => (
            <PlotMarker
              key={plot.id}
              plot={plot}
              isSelected={selectedPlotId === plot.id}
              isHighlighted={hoveredPlot?.id === plot.id}
              onPlotClick={handlePlotClick}
              onPlotHover={handlePlotHover}
              showTooltip={true}
              showPopup={false}
            />
          ))}
        </MapContainer>

        {showControls && (
          <MapControls
            currentLayer={currentLayer}
            onLayerChange={setCurrentLayer}
            showPlots={showPlots}
            onTogglePlots={() => setShowPlots(!showPlots)}
            onResetView={handleResetView}
            plotsCount={plotsCount}
          />
        )}
      </div>

      {/* Footer Stats */}
      {hasPlots && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-600">
              <span>
                <strong>{plotsCount}</strong> {t('plotMap.footer.plots')}
              </span>
              <span>
                <strong>{totalArea.toFixed(2)}</strong> {t('plotMap.footer.totalHectares')}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{t('plotMap.footer.activePlots')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotMap;