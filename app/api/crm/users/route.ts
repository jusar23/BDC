import { NextResponse } from "next/server";
import { getCrmAccess } from "@/lib/crm-auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const access = await getCrmAccess();
  if (!access) return { error: NextResponse.json({ error: "No tienes acceso al CRM." }, { status: 401 }), access: null };
  if (access.role !== "ADMIN") return { error: NextResponse.json({ error: "Solo un administrador puede gestionar usuarios." }, { status: 403 }), access: null };
  return { error: null, access };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const users = await prisma.crmUser.findMany({ orderBy: [{ role: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(users.map(({ id, email, fullName, role, canManageCatalog, canManageOrders, canManageChats, active, createdAt }) => ({ id, email, fullName, role, canManageCatalog: role === "ADMIN" || canManageCatalog, canManageOrders: role === "ADMIN" || canManageOrders, canManageChats: role === "ADMIN" || canManageChats, active, createdAt })));
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Falta configurar la clave administrativa privada de Supabase en Vercel." }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Los datos del usuario no son válidos." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim().slice(0, 120) : "";
  const role = body.role === "ADMIN" ? "ADMIN" : body.role === "EMPLOYEE" ? "EMPLOYEE" : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: "La contraseña inicial debe tener al menos 10 caracteres." }, { status: 400 });
  if (!role) return NextResponse.json({ error: "Selecciona un perfil válido." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
  if (createError || !data.user) return NextResponse.json({ error: createError?.message || "No se pudo crear la cuenta." }, { status: 400 });

  try {
    await prisma.crmUser.create({ data: {
      id: data.user.id,
      email,
      fullName: fullName || null,
      role,
      canManageCatalog: role === "EMPLOYEE" && body.canManageCatalog === true,
      canManageOrders: role === "EMPLOYEE" && body.canManageOrders === true,
      canManageChats: role === "EMPLOYEE" && body.canManageChats === true,
    } });
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch((rollbackError) => console.error("No se pudo revertir la cuenta de Auth:", rollbackError));
    console.error("No se pudo crear el permiso CRM:", error);
    return NextResponse.json({ error: "La cuenta no se pudo habilitar. Confirma que la tabla crm_users esté creada." }, { status: 503 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
