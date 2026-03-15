// ─────────────────────────────────────────────────────────────────────────────
// Marine Guardian Enterprise — Shared Enums
// All enum values match Prisma schema exactly.
// ─────────────────────────────────────────────────────────────────────────────

export enum TenantType {
  LGU = "LGU",
  BlueAlliance = "BlueAlliance",
}

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  FISHERIES_OFFICER = "FISHERIES_OFFICER",
  ENCODER = "ENCODER",
  VIEWER = "VIEWER",
  PATROLLER = "PATROLLER",
  BA_ADMIN = "BA_ADMIN",
  BA_ANALYST = "BA_ANALYST",
  BA_RANGER = "BA_RANGER",
}

export enum Rarity {
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  ENDANGERED = "ENDANGERED",
}

export enum Sex {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum ActivityCategory {
  BOAT_OWNER_OPERATOR = "BOAT_OWNER_OPERATOR",
  CAPTURE_FISHING = "CAPTURE_FISHING",
  GLEANING = "GLEANING",
  VENDOR = "VENDOR",
  FISH_PROCESSING = "FISH_PROCESSING",
  AQUACULTURE = "AQUACULTURE",
}

export enum VesselType {
  MOTORIZED = "MOTORIZED",
  NON_MOTORIZED = "NON_MOTORIZED",
}

export enum PermitType {
  FISHING_VESSEL = "FISHING_VESSEL",
  COMMERCIAL_FISHING = "COMMERCIAL_FISHING",
}

export enum PermitStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum ProgramType {
  EQUIPMENT_DISTRIBUTION = "EQUIPMENT_DISTRIBUTION",
  LIVELIHOOD_SUBSIDY = "LIVELIHOOD_SUBSIDY",
  TRAINING = "TRAINING",
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  UNDER_INVESTIGATION = "UNDER_INVESTIGATION",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export enum PatrolStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  IN_APP = "IN_APP",
}

export enum MobilePlatform {
  ios = "ios",
  android = "android",
}

// ─── Role scope helpers ───────────────────────────────────────────────────────

export const LGU_ROLES = [
  Role.SUPER_ADMIN,
  Role.FISHERIES_OFFICER,
  Role.ENCODER,
  Role.VIEWER,
  Role.PATROLLER,
] as const;

export const BA_ROLES = [Role.BA_ADMIN, Role.BA_ANALYST, Role.BA_RANGER] as const;

export const MUTATION_ALLOWED_ROLES = [
  Role.SUPER_ADMIN,
  Role.FISHERIES_OFFICER,
  Role.ENCODER,
  Role.BA_ADMIN,
  Role.BA_RANGER,
] as const;

export const PATROL_ROLES = [Role.PATROLLER, Role.BA_RANGER] as const;
