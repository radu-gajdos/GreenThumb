export interface Plot {
  id: string;
  name: string;
  size: number;
  boundary: GeoJsonPolygon;
  topography?: string | null;
  soilType?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}
