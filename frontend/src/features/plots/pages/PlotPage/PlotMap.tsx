/**
 * PlotMap.tsx
 *
 * Renders a Leaflet map showing a single GeoJSON polygon boundary.
 * Automatically fits the viewport to the boundary polygon.
 */

import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap,
  ZoomControl,
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

/**
 * DarkModeFilter
 * 
 * Applies a dark overlay to the map tiles to match the website's dark theme
 */
const DarkModeFilter: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    // Add a CSS filter to the map container for darkening
    const mapContainer = map.getContainer();
    mapContainer.style.filter = 'brightness(0.8) contrast(1.2) saturate(0.7)';
    
    return () => {
      // Clean up when component unmounts
      mapContainer.style.filter = '';
    };
  }, [map]);
  
  return null;
};

const PlotMap: React.FC<PlotMapProps> = ({ boundary }) => {
  // Convert the outer ring of GeoJSON [lng, lat] pairs into Leaflet's [lat, lng]
  const positions: LatLngExpression[] = boundary.coordinates[0].map(
    ([lng, lat]) => [lat, lng] as LatLngExpression
  );
  
  // State to track if map is ready to ensure proper z-index handling
  const [mapReady, setMapReady] = useState(false);
  
  useEffect(() => {
    // Set map as ready after a short delay to ensure proper initialization
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`w-full h-64 rounded-lg overflow-hidden shadow-md relative ${
        mapReady ? 'z-0' : 'invisible'
      }`}
    >
      {/* MapContainer center/zoom are initial; FitToBounds will override */}
      <MapContainer
        center={[0, 0]}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        whenReady={() => setMapReady(true)}
        style={{ zIndex: 0 }} // Ensure map has a low z-index
      >
        {/* High-resolution satellite imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
        />
        
        {/* Apply dark mode filter */}
        <DarkModeFilter />

        {/* Automatically adjust view to fit the polygon */}
        <FitToBounds positions={positions} />

        {/* Draw the polygon with semi-transparent fill */}
        <Polygon
          pathOptions={{
            color: '#3382ed',
            weight: 2,
            fillColor: '#3382ed',
            fillOpacity: 0.4, // Slightly increased for better visibility on darker base
          }}
          positions={positions}
        >
          {/* Optional permanent tooltip at the polygon's centroid */}
          <Tooltip direction="center" permanent>
            {/* TODO: Add plot-specific label (e.g. plot name or ID) */}
          </Tooltip>
        </Polygon>
        
        {/* Custom positioned zoom control */}
        <ZoomControl position="bottomright" />
      </MapContainer>
      
      {/* Attribution overlay with dark background for better visibility */}
      <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 z-10">
        Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics
      </div>
    </div>
  );
};

export default PlotMap;