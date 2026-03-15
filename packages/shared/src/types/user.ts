import { type Role, type TenantType } from "../enums.js";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isActive: boolean;
  lastActiveTenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
}

export interface TenantMembership {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtSessionPayload {
  userId: string;
  email: string;
  activeTenantId: string;
  activeTenantSlug: string;
  activeTenantType: TenantType;
  role: Role;
}
