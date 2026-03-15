import { z } from "zod";
import { Role, TenantType } from "../enums.js";

export const CreateTenantSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(TenantType),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  logoUrl: z.string().url().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  tenantSlug: z.string().optional(),
});

export const SelectTenantSchema = z.object({
  tenantId: z.string().cuid(),
});

export const CreateUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(200),
  password: z.string().min(8).max(100),
  tenantId: z.string().cuid(),
  role: z.nativeEnum(Role),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const MobileLoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  tenantSlug: z.string(),
  platform: z.enum(["ios", "android"]),
});

export const MobileRefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SelectTenantInput = z.infer<typeof SelectTenantSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type MobileLoginInput = z.infer<typeof MobileLoginSchema>;
export type MobileRefreshInput = z.infer<typeof MobileRefreshSchema>;
