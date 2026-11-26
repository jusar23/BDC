"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
};

const initialData: CheckoutFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
};

export default function CheckoutForm() {
  const { items, totalPrice } = useCart();
  const [customer, setCustomer] = useState(initialData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
        }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error ?? "No pudimos preparar el pago.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No pudimos preparar el pago.");
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof CheckoutFormData, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-700">Tu carrito está vacío.</p>
        <Link href="/repuestos" className="mt-5 inline-flex rounded-md bg-[#172b3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#243f55]">
          Explorar repuestos
        </Link>
      </div>
    );
  }

  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#647b6d] focus:ring-2 focus:ring-[#e1e8e3]";

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-950">Contacto y entrega</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Nombre completo
            <input className={inputClass} autoComplete="name" maxLength={100} required value={customer.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Correo electrónico
            <input className={inputClass} type="email" autoComplete="email" maxLength={180} required value={customer.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Teléfono
            <input className={inputClass} type="tel" autoComplete="tel" maxLength={30} required value={customer.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Dirección de entrega
            <input className={inputClass} autoComplete="street-address" maxLength={180} required value={customer.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Ciudad
            <input className={inputClass} autoComplete="address-level2" maxLength={100} required value={customer.city} onChange={(event) => updateField("city", event.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Departamento / región
            <input className={inputClass} autoComplete="address-level1" maxLength={100} required value={customer.region} onChange={(event) => updateField("region", event.target.value)} />
          </label>
        </div>
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
          Esta tienda está en modo de demostración. El envío aparece en $0 y el pago se simula en Sandbox; no se hacen cobros reales.
        </p>
        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold text-slate-950">Resumen del pedido</h2>
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">{item.name} <span className="text-slate-400">× {item.quantity}</span></span>
              <span className="shrink-0 font-medium text-slate-900">${(item.price * item.quantity).toLocaleString("es-CO")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
          <div className="flex justify-between text-slate-600"><span>Envío (demostración)</span><span>$0</span></div>
          <div className="flex justify-between text-base font-semibold text-slate-950"><span>Total estimado</span><span>${totalPrice.toLocaleString("es-CO")} COP</span></div>
        </div>
        <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-lg bg-amber-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? "Preparando pago…" : "Continuar a Wompi Sandbox"}
        </button>
        <Link href="/carrito" className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900">Volver al carrito</Link>
      </aside>
    </form>
  );
}
