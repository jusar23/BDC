import { NextResponse } from "next/server";
import { getCrmAccess } from "@/lib/crm-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const currentUser = await getCrmAccess();
  if (!currentUser) return NextResponse.json({ error: "No tienes acceso al CRM." }, { status: 401 });
  if (currentUser.role !== "ADMIN") return NextResponse.json({ error: "Solo un administrador puede gestionar usuarios." }, { status: 403 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Los datos de permisos no son válidos." }, { status: 400 }); }
  const role = body.role === "ADMIN" ? "ADMIN" : body.role === "EMPLOYEE" ? "EMPLOYEE" : null;
  if (!role || typeof body.active !== "boolean") return NextResponse.json({ error: "El perfil o estado no son válidos." }, { status: 400 });
  const target = await prisma.crmUser.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "No encontramos ese usuario." }, { status: 404 });
  if (target.id === currentUser.id && (role !== "ADMIN" || body.active !== true)) return NextResponse.json({ error: "No puedes quitar tu propio acceso de administrador." }, { status: 400 });
  if (target.role === "ADMIN" && (role !== "ADMIN" || body.active !== true)) {
    const activeAdmins = await prisma.crmUser.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1) return NextResponse.json({ error: "Debe quedar al menos un administrador activo." }, { status: 400 });
  }

  await prisma.crmUser.update({ where: { id }, data: {
    role,
    active: body.active,
    canManageCatalog: role === "EMPLOYEE" && body.canManageCatalog === true,
    canManageOrders: role === "EMPLOYEE" && body.canManageOrders === true,
    canManageChats: role === "EMPLOYEE" && body.canManageChats === true,
  } });
  return NextResponse.json({ ok: true });
}
