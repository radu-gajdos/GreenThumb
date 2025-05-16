/**
 * PlotMap.tsx
 *
 * Renders a Leaflet map showing a single GeoJSON polygon boundary.
 * Automatically fits the viewport to the boundary polygon.
 */

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, latLngBounds } from 'leaflet';
import { Polygon as GeoJSONPolygon } from 'geojson';

interface PlotMapProps {
  /** A GeoJSON Polygon defining the plot boundary (must have at least one ring) */
  boundary: GeoJSONPolygon;
}

/**
 * FitToBounds
 *
 * A helper component that, given an array of Leaflet LatLng positions,
 * instructs the map to zoom & pan so all positions are visible.
 */
const FitToBounds: React.FC<{ positions: LatLngExpression[] }> = ({
  positions,
}) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      // Compute the minimal bounding box and add padding
      const bounds = latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, positions]);

  return null; // This component does not render any DOM
};

const PlotMap: React.FC<PlotMapProps> = ({ boundary }) => {
  // Convert the outer ring of GeoJSON [lng, lat] pairs into Leaflet’s [lat, lng]
  const positions: LatLngExpression[] = boundary.coordinates[0].map(
    ([lng, lat]) => [lat, lng] as LatLngExpression
  );

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-md">
      {/* MapContainer center/zoom are initial; FitToBounds will override */}
      <MapContainer
        center={[0, 0]}
        zoom={15}
        className="w-full h-full"
        zoomControl
        attributionControl
      >
        {/* High-resolution satellite imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
        />

        {/* Automatically adjust view to fit the polygon */}
        <FitToBounds positions={positions} />

        {/* Draw the polygon with semi-transparent fill */}
        <Polygon
          pathOptions={{
            color: '#3382ed',
            weight: 2,
            fillColor: '#3382ed',
            fillOpacity: 0.3,
          }}
          positions={positions}
        >
          {/* Optional permanent tooltip at the polygon’s centroid */}
          <Tooltip direction="center" permanent>
            {/* TODO: Add plot-specific label (e.g. plot name or ID) */}
          </Tooltip>
        </Polygon>
      </MapContainer>
    </div>
  );
};

export default PlotMap;
