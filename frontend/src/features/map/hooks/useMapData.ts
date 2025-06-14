// src/features/plots/hooks/useMapData.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import { LatLngExpression } from 'leaflet';
import { PlotApi } from '@/features/plots/api/plot.api';
import { Plot } from '@/features/plots/interfaces/plot';

/** Default fallback center (central Romania) */
const DEFAULT_CENTER: LatLngExpression = [45.0, 25.0];

export interface UseMapDataOptions {
  autoLoad?: boolean;
  defaultCenter?: LatLngExpression;
}

export interface UseMapDataReturn {
  // Data
  plots: Plot[];
  mapCenter: LatLngExpression;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  loadPlots: () => Promise<void>;
  setMapCenter: (center: LatLngExpression) => void;
  calculateCenterFromPlots: () => LatLngExpression | null;
  
  // Computed
  totalArea: number;
  plotsCount: number;
  hasPlots: boolean;
}

export const useMapData = (options: UseMapDataOptions = {}): UseMapDataReturn => {
  const { 
    autoLoad = true, 
    defaultCenter = DEFAULT_CENTER 
  } = options;

  // State
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultCenter);

  // API instance
  const plotApi = useMemo(() => new PlotApi(), []);

  // Calculate center from current plots
  const calculateCenterFromPlots = useCallback((): LatLngExpression | null => {
    if (plots.length === 0) return null;

    const allCoords: LatLngExpression[] = plots.flatMap((plot) =>
      (plot.boundary.coordinates?.[0] || []).map(
        ([lng, lat]): LatLngExpression => [lat, lng]
      )
    );

    if (allCoords.length === 0) return null;

    const latSum = allCoords.reduce((sum, coord) => {
      const lat = Array.isArray(coord) ? coord[0] : (coord as any).lat;
      return sum + (lat as number);
    }, 0);
    const lngSum = allCoords.reduce((sum, coord) => {
      const lng = Array.isArray(coord) ? coord[1] : (coord as any).lng;
      return sum + (lng as number);
    }, 0);
    const centerLat = latSum / allCoords.length;
    const centerLng = lngSum / allCoords.length;

    return [centerLat, centerLng];
  }, [plots]);

  // Helper function to calculate center from data
  const calculateCenterFromData = useCallback((data: Plot[]): LatLngExpression | null => {
    if (data.length === 0) return null;

    const allCoords: LatLngExpression[] = data.flatMap((plot) =>
      (plot.boundary.coordinates?.[0] || []).map(
        ([lng, lat]): LatLngExpression => [lat, lng]
      )
    );

    if (allCoords.length === 0) return null;

    const latSum = allCoords.reduce((sum, coord) => {
      const lat = Array.isArray(coord) ? coord[0] : (coord as any).lat;
      return sum + (lat as number);
    }, 0);
    const lngSum = allCoords.reduce((sum, coord) => {
      const lng = Array.isArray(coord) ? coord[1] : (coord as any).lng;
      return sum + (lng as number);
    }, 0);
    const centerLat = latSum / allCoords.length;
    const centerLng = lngSum / allCoords.length;

    return [centerLat, centerLng];
  }, []);

  // Load plots from API - FIXED to avoid infinite loop
  const loadPlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await plotApi.findAll();
      setPlots(data);
      
      // Set map center to a random plot coordinate (like in original)
      if (data.length > 0) {
        const allCoords: LatLngExpression[] = data.flatMap((plot) =>
          (plot.boundary.coordinates?.[0] || []).map(
            ([lng, lat]): LatLngExpression => [lat, lng]
          )
        );
        
        if (allCoords.length > 0) {
          // Pick a random coordinate from all available coordinates
          const randomIndex = Math.floor(Math.random() * allCoords.length);
          setMapCenter(allCoords[randomIndex]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută la încărcarea terenurilor';
      setError(errorMessage);
      console.error('Failed to load plots:', err);
    } finally {
      setLoading(false);
    }
  }, [plotApi]);

  // Computed values
  const totalArea = useMemo(() => {
    return plots.reduce((sum, plot) => sum + (plot.size || 0), 0);
  }, [plots]);

  const plotsCount = plots.length;
  const hasPlots = plotsCount > 0;

  // Auto-load on mount - FIXED to run only once
  useEffect(() => {
    if (autoLoad) {
      loadPlots();
    }
  }, [autoLoad, loadPlots]); // Added loadPlots back since we simplified the dependencies

  return {
    // Data
    plots,
    mapCenter,
    
    // State
    loading,
    error,
    
    // Actions
    loadPlots,
    setMapCenter,
    calculateCenterFromPlots,
    
    // Computed
    totalArea,
    plotsCount,
    hasPlots,
  };
};