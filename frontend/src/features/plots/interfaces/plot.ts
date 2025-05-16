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
  owner: IUser;
  actions: IAction[];
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface IUser {
  id: string;
  name?: string;
  email?: string;
}

export interface IAction {
  id: string;
  type: string;
  plot?: Plot;
  [key: string]: any; // For specific action properties
}

export interface IPlanting extends IAction {
  cropType: string;
  variety?: string;
  seedingRate?: string;
  plantingDate: Date;
}

export interface IHarvesting extends IAction {
  cropYield: number;
  harvestDate: Date;
  comments?: string;
}

export interface IFertilizing extends IAction {
  fertilizerType: string;
  applicationRate: number;
  method: string;
}

export interface ITreatment extends IAction {
  pesticideType: string;
  targetPest: string;
  dosage: number;
  applicationMethod: string;
}

export interface IWatering extends IAction {
  method: string;
  amount?: number;
  waterSource?: string;
}

export interface ISoilReading extends IAction {
  ph: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organicMatter?: string;
}