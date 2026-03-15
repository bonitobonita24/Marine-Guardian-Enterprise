export interface AuditLog {
  id: string;
  tenantId: string | null;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface Barangay {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Species {
  id: string;
  name: string;
  commonName: string;
  rarity: import("../enums.js").Rarity;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}
