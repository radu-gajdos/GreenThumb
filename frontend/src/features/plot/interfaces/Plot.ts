export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Plot {
  id: number;
  name: string;
  size: number;
  boundary: GeoJsonPolygon;
  topography?: string;
  soilType?: string;
  createdAt: string;
  updatedAt: string;
}
