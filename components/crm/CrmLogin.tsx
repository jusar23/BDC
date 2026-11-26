"use client";

import { useState } from "react";

export default function CrmLogin({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/crm/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo iniciar sesión.");
      window.location.href = "/crm";
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión."); setBusy(false); }
  }
  return <div className="crm-shell flex min-h-screen items-center justify-center bg-[#f4f5f3] px-5 py-12">
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-700">Andina Motor</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Acceso al CRM</h1><p className="mt-2 text-sm text-slate-500">Panel interno de catálogo y atención comercial.</p></div>
      {!configured ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Falta conectar Supabase Auth.</strong><br/>Configura la URL del proyecto y su clave pública en el entorno de la aplicación.</div> : <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">Correo de administrador<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
        <label className="block text-sm font-medium text-slate-700">Contraseña<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-[#172b3d] px-4 py-3 font-semibold text-white transition hover:bg-[#243f55] disabled:opacity-60">{busy ? "Ingresando…" : "Ingresar al panel"}</button>
      </form>}
      <a href="/" className="mt-7 inline-block text-sm font-medium text-slate-500 hover:text-slate-900">← Volver a la tienda</a>
    </section>
  </div>;
}
