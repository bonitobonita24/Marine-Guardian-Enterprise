import { type TenantType } from "../enums.js";

export interface Tenant {
  id: string;
  name: string;
  type: TenantType;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantPublic {
  id: string;
  name: string;
  type: TenantType;
  slug: string;
  logoUrl: string | null;
}
