export interface CatchReport {
  id: string;
  tenantId: string;
  vesselId: string;
  fisherfolkId: string;
  speciesId: string | null;
  speciesFreeText: string | null;
  catchVolumeKg: number;
  catchDate: Date;
  landingLocation: string;
  notes: string | null;
  createdAt: Date;
}
