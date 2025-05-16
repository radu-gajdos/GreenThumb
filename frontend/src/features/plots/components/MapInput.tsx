import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
  useMap,
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { LatLngExpression, latLngBounds, Icon } from 'leaflet';
import { GeoJsonPolygon } from '../interfaces/plot';

// GeoSearch imports
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

/**
 * Default map center (approx. central Romania) used when no value is provided.
 */
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];

interface PlotEditorProps {
  value?: GeoJsonPolygon;
  onChange?: (boundary: GeoJsonPolygon) => void;
}

/** Re-centers/zooms to bounds whenever they change */
function FitBounds({ bounds }: { bounds: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(latLngBounds(bounds), { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

/** Forces the map to move to the `center` whenever it updates */
function RecenterMap({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

/** Adds the search control once to the map, with a valid default icon */
function SearchBox() {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      // supply the default Leaflet marker icon
      marker: {
        icon: new Icon.Default(),
        draggable: false,
      },
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });
    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);
  return null;
}

const MapInput: React.FC<PlotEditorProps> = ({ value, onChange }) => {
  // drawn polygon rings
  const [coords, setCoords] = useState<number[][][]>(value?.coordinates || []);
  // map center—moves once geolocation resolves
  const [center, setCenter] = useState<LatLngExpression>(DEFAULT_CENTER);

  // sync in external value
  useEffect(() => {
    if (value?.coordinates) {
      setCoords(value.coordinates);
    }
  }, [value]);

  // ask browser for geolocation once
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // ignore failures
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const extractCoords = (layer: any) =>
    (layer.getLatLngs()[0] as L.LatLng[]).map((pt) => [pt.lng, pt.lat]);

  const handleCreated = (e: any) => {
    const ring = extractCoords(e.layer);
    setCoords([ring]);
    onChange?.({ type: 'Polygon', coordinates: [ring] });
  };

  const handleEdited = (e: any) => {
    const layer = e.layers.getLayers()[0];
    const ring = extractCoords(layer);
    setCoords([ring]);
    onChange?.({ type: 'Polygon', coordinates: [ring] });
  };

  // convert for Leaflet
  const latLngs: LatLngExpression[] =
    coords.length > 0 ? coords[0].map(([lng, lat]) => [lat, lng]) : [];

  return (
    <div className="w-full h-[400px] border rounded overflow-hidden">
      <MapContainer center={center} zoom={13} className="w-full h-full">
        {/* move when `center` changes */}
        <RecenterMap center={center} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Sursa: Esri, Maxar, Earthstar Geographics"
        />

        {/* place search widget */}
        <SearchBox />

        {/* zoom to your drawn polygon */}
        {latLngs.length > 0 && <FitBounds bounds={latLngs} />}

        <FeatureGroup>
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
          {latLngs.length > 0 && (
            <Polygon pathOptions={{ color: 'green', weight: 2 }} positions={latLngs} />
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default MapInput;
