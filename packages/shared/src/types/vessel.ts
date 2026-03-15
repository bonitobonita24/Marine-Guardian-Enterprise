import { type VesselType } from "../enums.js";

export interface Vessel {
  id: string;
  tenantId: string;
  ownerId: string;
  vesselName: string;
  registrationNumber: string;
  type: VesselType;
  lengthMeters: number | null;
  tonnage: number | null;
  gearType: string | null;
  homePortBarangayId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
