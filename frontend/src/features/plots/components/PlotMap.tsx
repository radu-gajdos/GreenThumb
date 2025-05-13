import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { GeoJsonPolygon } from '../interfaces/plot';

/** 
 * Default map center (central Romania) 
 * Typed as LatLngExpression for Leaflet compatibility
 */
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];

interface PlotMapProps {
  /** 
   * Array of plots to render on the map.
   * Each plot has an `id`, `name` (unused here, but useful for tooltips/labels), 
   * and a GeoJSON Polygon boundary.
   */
  plots?: Array<{ id: number; name: string; boundary: GeoJsonPolygon }>;
}

/**
 * PlotMap
 * 
 * Renders one or more plot boundaries as green polygons on a Leaflet map.
 */
const PlotMap: React.FC<PlotMapProps> = ({ plots = [] }) => {
  // Ensure we always have an array to avoid runtime errors
  const plotList = Array.isArray(plots) ? plots : [];

  return (
    <div className="w-full h-[500px] border rounded overflow-hidden">
      {/* Main Leaflet map container */}
      <MapContainer center={DEFAULT_CENTER} zoom={12} className="w-full h-full">
        {/* Satellite imagery base layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Sursa: Esri, Maxar, Earthstar Geographics"
        />

        {/* Render each plot as a Polygon */}
        {plotList.map((plot) => {
          // Safely extract the outer ring of coordinates or default to empty
          const ring = 
            Array.isArray(plot.boundary.coordinates) && 
            Array.isArray(plot.boundary.coordinates[0])
              ? plot.boundary.coordinates[0]
              : [];

          // Convert [lng, lat] → [lat, lng] for Leaflet
          const positions = ring.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );

          return (
            <Polygon
              key={plot.id}
              pathOptions={{ color: 'green', weight: 2 }}
              positions={positions}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PlotMap;
