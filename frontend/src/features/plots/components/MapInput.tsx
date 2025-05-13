import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { LatLngExpression } from 'leaflet';
import { GeoJsonPolygon } from '../interfaces/plot';

/**
 * Default map center (approx. central Romania) used when no value is provided.
 */
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];

interface PlotEditorProps {
  /** Existing polygon to display/edit */
  value?: GeoJsonPolygon;
  /** Callback when the polygon boundary changes */
  onChange?: (boundary: GeoJsonPolygon) => void;
}

/**
 * MapInput
 *
 * Renders a Leaflet map with draw/edit controls for a single polygon.
 * Maintains local coord state and notifies parent via `onChange`.
 */
const MapInput: React.FC<PlotEditorProps> = ({ value, onChange }) => {
  // Store array of rings: [ [ [lng, lat], ... ] ]
  const [coords, setCoords] = useState<number[][][]>(value?.coordinates || []);

  // Sync local coords if parent value prop changes (e.g. when editing existing plot)
  useEffect(() => {
    if (value?.coordinates) {
      setCoords(value.coordinates);
    }
  }, [value]);

  /**
   * Extract [lng, lat] pairs from a Leaflet layer.
   * @param layer - A drawn polygon layer
   * @returns Array of [lng, lat] tuples
   */
  const extractCoords = (layer: any) => {
    // getLatLngs()[0] returns outer ring
    const latlngs = layer.getLatLngs()[0] as L.LatLng[];
    return latlngs.map(pt => [pt.lng, pt.lat]);
  };

  /**
   * Handler for new polygon creation.
   */
  const handleCreated = (e: any) => {
    const newCoords = extractCoords(e.layer);
    const updated = [newCoords];
    setCoords(updated);
    onChange?.({ type: 'Polygon', coordinates: updated });
  };

  /**
   * Handler for edits to existing polygon(s).
   */
  const handleEdited = (e: any) => {
    // Only handle the first edited layer
    const editedLayer = e.layers.getLayers()[0];
    const newCoords = extractCoords(editedLayer);
    const updated = [newCoords];
    setCoords(updated);
    onChange?.({ type: 'Polygon', coordinates: updated });
  };

  return (
    <div className="w-full h-[400px] border rounded overflow-hidden">
      {/* Leaflet map container */}
      <MapContainer center={DEFAULT_CENTER} zoom={13} className="w-full h-full">
        {/* Satellite imagery tiles */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Sursa: Esri, Maxar, Earthstar Geographics"
        />
        <FeatureGroup>
          {/* Draw/edit toolbar */}
          <EditControl
            position="topright"
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
              polyline: false,
            }}
            edit={{ edit: true, remove: true }}
            onCreated={handleCreated}
            onEdited={handleEdited}
          />
          {/* Render existing polygon */}
          {coords.length > 0 && (
            <Polygon
              // Path options can be pulled from theme or props if needed
              pathOptions={{ color: 'green', weight: 2 }}
              // Leaflet expects [lat, lng]
              positions={coords[0].map(([lng, lat]) => [lat, lng] as [number, number])}
            />
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default MapInput;
