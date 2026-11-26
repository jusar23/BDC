import { NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) return NextResponse.json({ error: "Supabase Auth todavía no está configurado." }, { status: 503 });
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Revisa tus credenciales e inténtalo de nuevo." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Escribe tu correo y contraseña." }, { status: 400 });

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });

    let access;
    try {
      access = await prisma.crmUser.findUnique({ where: { id: data.user.id } });
    } catch (error) {
      await supabase.auth.signOut();
      console.error("No se pudo consultar crm_users:", error);
      return NextResponse.json({ error: "La tabla de permisos crm_users todavía no está disponible en Supabase." }, { status: 503 });
    }
    if (!access || !access.active || access.email.toLowerCase() !== email) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Tu cuenta todavía no tiene acceso al CRM. Habilítala en la tabla crm_users de Supabase." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("No se pudo iniciar la sesión del CRM:", error);
    return NextResponse.json({ error: "No se pudo conectar con Supabase Auth. Verifica las variables del proyecto en Vercel." }, { status: 503 });
  }
}

export async function DELETE() {
  if (!isSupabaseAuthConfigured()) return NextResponse.json({ ok: true });
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
