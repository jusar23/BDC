import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const isCrmConfigured = isSupabaseAuthConfigured;

export type CrmAccess = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "EMPLOYEE";
  canManageCatalog: boolean;
  canManageOrders: boolean;
  canManageChats: boolean;
};

export async function getCrmAccess(): Promise<CrmAccess | null> {
  if (!isSupabaseAuthConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) return null;
  const access = await prisma.crmUser.findUnique({ where: { id: user.id } });
  if (!access || !access.active || access.email.toLowerCase() !== (user.email ?? "").toLowerCase()) return null;
  return {
    id: access.id,
    email: access.email,
    fullName: access.fullName,
    role: access.role,
    canManageCatalog: access.role === "ADMIN" || access.canManageCatalog,
    canManageOrders: access.role === "ADMIN" || access.canManageOrders,
    canManageChats: access.role === "ADMIN" || access.canManageChats,
  };
}
