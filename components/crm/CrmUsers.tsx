"use client";

import { useEffect, useState } from "react";

type Role = "ADMIN" | "EMPLOYEE";
type CrmUser = { id: string; email: string; fullName: string | null; role: Role; canManageCatalog: boolean; canManageOrders: boolean; canManageChats: boolean; active: boolean; createdAt: string };
type UserForm = { email: string; password: string; fullName: string; role: Role; canManageCatalog: boolean; canManageOrders: boolean; canManageChats: boolean; active: boolean };
const emptyForm: UserForm = { email: "", password: "", fullName: "", role: "EMPLOYEE", canManageCatalog: false, canManageOrders: false, canManageChats: false, active: true };
const permissionLabels = { canManageCatalog: "Gestionar catálogo", canManageOrders: "Gestionar pedidos", canManageChats: "Gestionar chats" } as const;

function PermissionFields({ form, set }: { form: UserForm; set: (key: keyof UserForm, value: string | boolean) => void }) {
  if (form.role === "ADMIN") return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">El perfil administrador tiene acceso completo al CRM y puede administrar usuarios.</p>;
  return <div className="space-y-3 rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold">Permisos del empleado</p>{Object.entries(permissionLabels).map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={form[key as keyof typeof permissionLabels]} onChange={(event) => set(key as keyof UserForm, event.target.checked)} className="h-4 w-4 accent-amber-600" />{label}</label>)}</div>;
}

export default function CrmUsers() {
  const [users, setUsers] = useState<CrmUser[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [editing, setEditing] = useState<CrmUser | "new" | null>(null); const [form, setForm] = useState<UserForm>(emptyForm); const [busy, setBusy] = useState(false);
  function set(key: keyof UserForm, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })); }
  async function loadUsers() {
    const response = await fetch("/api/crm/users", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo cargar el equipo.");
    setUsers(result);
  }
  useEffect(() => { void loadUsers().catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudo cargar el equipo.")).finally(() => setLoading(false)); }, []);
  function openNew() { setError(""); setNotice(""); setForm(emptyForm); setEditing("new"); }
  function openEdit(user: CrmUser) { setError(""); setNotice(""); setForm({ email: user.email, password: "", fullName: user.fullName ?? "", role: user.role, canManageCatalog: user.canManageCatalog, canManageOrders: user.canManageOrders, canManageChats: user.canManageChats, active: user.active }); setEditing(user); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return; setBusy(true); setError(""); setNotice("");
    const payload = { ...form };
    if (editing !== "new" && editing.role === "ADMIN" && form.role !== "ADMIN" && !window.confirm("¿Quitar el acceso completo de administrador a esta cuenta?")) { setBusy(false); return; }
    if (editing !== "new" && editing.active && !form.active && !window.confirm("La cuenta perderá acceso al CRM. ¿Quieres desactivarla?")) { setBusy(false); return; }
    try {
      const response = await fetch(editing === "new" ? "/api/crm/users" : `/api/crm/users/${editing.id}`, { method: editing === "new" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el usuario.");
      setEditing(null); setNotice(editing === "new" ? "La cuenta quedó creada y habilitada." : "Los permisos se actualizaron."); await loadUsers();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el usuario."); }
    finally { setBusy(false); }
  }
  const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100";
  return <section className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-bold">Usuarios y permisos</h2><p className="mt-1 text-sm text-slate-500">Crea cuentas del equipo y define qué secciones puede gestionar cada persona.</p></div><button onClick={openNew} className="rounded-lg bg-[#172b3d] px-4 py-2.5 text-sm font-semibold text-white">＋ Crear usuario</button></div>
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">Las cuentas se guardan en Supabase Auth. Desde aquí puedes crear empleados y administrar sus permisos; la clave de Supabase necesaria para crear cuentas permanece en el servidor.</div>
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}{error && !editing && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Usuario</th><th className="px-5 py-3">Perfil</th><th className="px-5 py-3">Permisos</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="px-5 py-4"><p className="font-semibold">{user.fullName || user.email}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-4">{user.role === "ADMIN" ? "Administrador" : "Empleado"}</td><td className="px-5 py-4 text-xs text-slate-600">{user.role === "ADMIN" ? "Acceso completo" : [user.canManageCatalog && "Catálogo", user.canManageOrders && "Pedidos", user.canManageChats && "Chats"].filter(Boolean).join(" · ") || "Solo consulta"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{user.active ? "Activo" : "Inactivo"}</span></td><td className="px-5 py-4 text-right"><button onClick={() => openEdit(user)} className="font-semibold text-slate-700 hover:text-amber-800">Administrar</button></td></tr>)}</tbody></table></div>{loading ? <p className="p-8 text-center text-sm text-slate-500">Cargando equipo…</p> : users.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Aún no hay cuentas habilitadas.</p>}</div>
    {editing && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 sm:p-8"><section role="dialog" aria-modal="true" aria-labelledby="user-editor-title" className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl"><header className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Equipo</p><h3 id="user-editor-title" className="mt-1 text-xl font-bold">{editing === "new" ? "Crear usuario" : "Administrar usuario"}</h3></div><button type="button" onClick={() => setEditing(null)} aria-label="Cerrar" className="rounded-lg px-3 py-1 text-2xl text-slate-400 hover:bg-slate-100">×</button></header><form onSubmit={submit} className="space-y-5 p-6">
      {editing === "new" ? <><label className="block text-sm font-medium text-slate-700">Nombre<input required autoComplete="name" className={input} value={form.fullName} onChange={(event) => set("fullName", event.target.value)} /></label><label className="block text-sm font-medium text-slate-700">Correo<input required type="email" autoComplete="off" className={input} value={form.email} onChange={(event) => set("email", event.target.value)} /></label><label className="block text-sm font-medium text-slate-700">Contraseña inicial<input required type="password" minLength={10} autoComplete="new-password" className={input} value={form.password} onChange={(event) => set("password", event.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">Mínimo 10 caracteres; se guarda en Supabase Auth.</span></label></> : <div className="rounded-lg bg-slate-50 p-4"><p className="font-semibold">{form.fullName || form.email}</p><p className="mt-1 text-sm text-slate-500">{form.email}</p></div>}
      <label className="block text-sm font-medium text-slate-700">Perfil<select className={input} value={form.role} onChange={(event) => set("role", event.target.value)}><option value="EMPLOYEE">Empleado</option><option value="ADMIN">Administrador</option></select></label><PermissionFields form={form} set={set} />{editing !== "new" && <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.active} onChange={(event) => set("active", event.target.checked)} className="h-4 w-4 accent-amber-600" />Cuenta activa</label>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button><button disabled={busy} className="rounded-lg bg-[#172b3d] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Guardando…" : editing === "new" ? "Crear cuenta" : "Guardar permisos"}</button></div>
    </form></section></div>}
  </section>;
}
