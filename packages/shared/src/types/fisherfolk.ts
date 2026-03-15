import { type ActivityCategory, type Sex } from "../enums.js";

export interface Fisherfolk {
  id: string;
  tenantId: string;
  fisherfolkCode: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: Date;
  sex: Sex;
  barangayId: string;
  contactNumber: string | null;
  rsbsaNumber: string | null;
  activityCategories: ActivityCategory[];
  photoUrl: string | null;
  signatureUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FisherfolkPublic {
  id: string;
  tenantId: string;
  fisherfolkCode: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: Date;
  sex: Sex;
  barangayId: string;
  contactNumber: string | null;
  rsbsaNumber: string | null;
  activityCategories: ActivityCategory[];
  photoUrl: string | null;
  isActive: boolean;
}
