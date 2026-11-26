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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });

  const access = await prisma.crmUser.findUnique({ where: { id: data.user.id } });
  if (!access || !access.active || access.email.toLowerCase() !== email) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Tu cuenta todavía no tiene acceso al CRM. Solicítale al administrador que la habilite en Supabase." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!isSupabaseAuthConfigured()) return NextResponse.json({ ok: true });
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
