export interface Fueling {
  id: string;
  date: string;
  liters: number;
  value: number;
  station: string;
  bill?: string;
  billPhotoUrl?: string;
}

export interface TripDetail {
  dateStart: string;
  timeStart: string;
  dateEnd: string;
  timeEnd: string;
  route: string;
  distanceTotal: number;
  distanceOffroad: number;
  client: string;
  user: string;
}

export interface DailyEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  kmStart: number;
  kmEnd: number;
  tripCount: number;
  fuelings: Fueling[];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  route: string;
}

export interface Settings {
  pfaName: string;
  pfaCif: string;
  carBrand: string;
  carModel: string;
  carPlate: string;
  driverName: string;
  fuelNorm: number;
  defaultZone: string;
}

export interface AppData {
  settings: Settings;
  entries: DailyEntry[];
}
