// src/components/PlotMap.tsx
import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonPolygon } from './plot/interfaces/Plot';
import { LatLngExpression } from 'leaflet';

const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];  // now TS knows this is valid

interface PlotMapProps {
  plots?: Array<{ id: number; name: string; boundary: GeoJsonPolygon }>;
}

const PlotMap: React.FC<PlotMapProps> = ({ plots = [] }) => {
  // Ensure we have an array before mapping
  const plotList = Array.isArray(plots) ? plots : [];

  return (
    <div className="w-full h-[500px] border rounded overflow-hidden">
      <MapContainer center={DEFAULT_CENTER} zoom={12} className="w-full h-full">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Sursa: Esri, Maxar, Earthstar Geographics"
        />
        {plotList.map((plot) => (
          <Polygon
            key={plot.id}
            pathOptions={{ color: 'green', weight: 2 }}
            positions={
              Array.isArray(plot.boundary.coordinates) && Array.isArray(plot.boundary.coordinates[0])
                ? plot.boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])
                : []
            }
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default PlotMap;
