import { z } from "zod";

export const assignRoleInput = z.object({
  userId: z.string(),
  roleId: z.string(),
});

export const createRoleInput = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

export const updateRoleInput = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  description: z.string().optional(),
});

export const createPermissionInput = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  resource: z.string().min(1, "Recurso é obrigatório"),
  action: z.string().min(1, "Ação é obrigatória"),
});

export const assignPermissionToRoleInput = z.object({
  roleId: z.string(),
  permissionId: z.string(),
});

export const removePermissionFromRoleInput = z.object({
  roleId: z.string(),
  permissionId: z.string(),
});

export const assignCompanyInput = z.object({
  userId: z.string(),
  companyId: z.string(),
  code: z.string().optional(),
});

export const removeCompanyInput = z.object({
  userId: z.string(),
  companyId: z.string(),
});

