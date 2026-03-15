import { type PatrolStatus } from "../enums.js";

// GPS route format: [longitude, latitude, timestamp][]
export type GpsPoint = [number, number, number];

export interface Patrol {
  id: string;
  tenantId: string;
  vesselId: string;
  startedById: string;
  startTime: Date;
  endTime: Date | null;
  fuelConsumedLiters: number | null;
  routeGeoJson: GpsPoint[] | null;
  notes: string | null;
  status: PatrolStatus;
  createdAt: Date;
  updatedAt: Date;
}
