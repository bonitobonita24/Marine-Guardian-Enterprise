import { type IncidentStatus } from "../enums.js";

export interface Incident {
  id: string;
  tenantId: string;
  reportedById: string;
  violatorName: string;
  violatorInfo: string | null;
  vesselId: string | null;
  gearUsed: string | null;
  latitude: number | null;
  longitude: number | null;
  incidentDate: Date;
  description: string;
  evidenceUrls: string[];
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
}
