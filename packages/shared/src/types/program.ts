import { type ProgramType } from "../enums.js";

export interface Program {
  id: string;
  tenantId: string;
  name: string;
  type: ProgramType;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramBeneficiary {
  id: string;
  programId: string;
  fisherfolkId: string;
  enrolledAt: Date;
}

export interface DistributionEvent {
  id: string;
  programId: string;
  fisherfolkId: string;
  itemGiven: string;
  quantity: number;
  distributionDate: Date;
  notes: string | null;
  createdAt: Date;
}
