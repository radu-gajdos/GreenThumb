import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, latLngBounds } from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { PlotApi } from '@/features/plots/api/plot.api';
import { Plot } from '@/features/plots/interfaces/plot';

/** Default fallback center (central Romania) */
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];

interface PlotMapProps {}

/** FitBounds: when `bounds` change, fit the map to those bounds. */
function FitToBounds({ bounds }: { bounds: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(latLngBounds(bounds), { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

/** Adds the search control once to the map. */
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

const PlotMap: React.FC<PlotMapProps> = () => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const plotApi = useMemo(() => new PlotApi(), []);

  // 1) Fetch all user plots on mount
  useEffect(() => {
    plotApi
      .findAll()
      .then((data) => setPlots(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [plotApi]);

  // 2) Compute a flat array of all polygon vertices in Leaflet’s [lat, lng]
  const allCorners: LatLngExpression[] = plots.flatMap((p) => {
    const ring = p.boundary.coordinates?.[0] || [];
    return ring.map(([lng, lat]) => [lat, lng] as LatLngExpression);
  });

  return (
    <div className="w-full h-[500px] border rounded overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          Loading plots…
        </div>
      )}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        className="w-full h-full"
      >
        {/* Satellite imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Sursa: Esri, Maxar, Earthstar Geographics"
        />

        {/* Search bar */}
        <SearchBar />

        {/* Auto-fit to all your plots (if any) */}
        {allCorners.length > 0 && <FitToBounds bounds={allCorners} />}

        {/* Draw each plot boundary with tooltip */}
        {plots.map((plot) => {
          const ring = plot.boundary.coordinates?.[0] || [];
          const positions = ring.map(
            ([lng, lat]) => [lat, lng] as LatLngExpression
          );

          return (
            <Polygon
              key={plot.id}
              pathOptions={{ color: 'green', weight: 2 }}
              positions={positions}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9} sticky>
                {plot.name}
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PlotMap;
