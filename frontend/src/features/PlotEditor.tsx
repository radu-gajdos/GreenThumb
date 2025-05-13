// Install dependencies:
// npm install leaflet react-leaflet leaflet-draw react-leaflet-draw axios
// Make sure to include these CSS imports in your index.tsx or App.tsx:
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-draw/dist/leaflet.draw.css';

// src/components/PlotEditor.tsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';
import { LatLngExpression } from 'leaflet';
import PlotApi from './plot/api/plot.api';
import { GeoJsonPolygon } from './plot/interfaces/Plot';
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];
const plotApi = new PlotApi();

interface PlotEditorProps {
  initialBoundary?: number[][][];
  plotId?: number;
  onSaved?: () => void;
}

const PlotEditor: React.FC<PlotEditorProps> = ({ initialBoundary, plotId, onSaved }) => {
  const [coords, setCoords] = useState<number[][][]>(initialBoundary || []);
  const [loading, setLoading] = useState(false);

  const extractCoords = (layer: any) => {
    const latlngs = layer.getLatLngs()[0] as L.LatLng[];
    return latlngs.map(pt => [pt.lng, pt.lat]);
  };

  const handleCreated = (e: any) => {
    const newCoords = extractCoords(e.layer);
    setCoords([newCoords]);
  };

  const handleEdited = (e: any) => {
    const editedLayer = e.layers.getLayers()[0];
    const newCoords = extractCoords(editedLayer);
    setCoords([newCoords]);
  };

  const handleSave = () => {
    if (!coords.length) return;
    setLoading(true);

    const boundary: GeoJsonPolygon = { type: 'Polygon', coordinates: coords };
    const payload = { name: plotId ? `Plot #${plotId}` : 'New Plot', size: 0, boundary };

    const callback = () => {
      setLoading(false);
      onSaved && onSaved();
    };

    if (plotId) {
      plotApi.update(plotId, payload, callback);
    } else {
      plotApi.create(payload, () => callback());
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full h-[400px] border rounded overflow-hidden">
        <MapContainer center={DEFAULT_CENTER} zoom={13} className="w-full h-full">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri — Sursa: Esri, Maxar, Earthstar Geographics"
          />
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{ rectangle: false, circle: false, marker: false, circlemarker: false, polyline: false }}
              edit={{ edit: true, remove: true }}
              onCreated={handleCreated}
              onEdited={handleEdited}
            />
            {coords.length > 0 && (
              <Polygon
                pathOptions={{ color: 'green', weight: 2 }}
                positions={coords[0].map(([lng, lat]) => [lat, lng] as [number, number])}
              />
            )}
          </FeatureGroup>
        </MapContainer>
      </div>
      <button
        onClick={handleSave}
        disabled={loading || !coords.length}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : plotId ? 'Update Plot' : 'Save Plot'}
      </button>
    </div>
  );
};

export default PlotEditor;