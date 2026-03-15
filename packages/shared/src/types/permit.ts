import { type PermitStatus, type PermitType } from "../enums.js";

export interface Permit {
  id: string;
  tenantId: string;
  vesselId: string;
  type: PermitType;
  status: PermitStatus;
  issuedAt: Date | null;
  expiresAt: Date | null;
  approvedById: string | null;
  rejectionNotes: string | null;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
