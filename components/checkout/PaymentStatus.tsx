"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type OrderSummary = {
  reference: string;
  status: "PENDING_PAYMENT" | "PAID" | "PAYMENT_FAILED";
  currency: string;
  totalInCents: number;
  items: Array<{ productName: string; quantity: number }>;
};

export default function PaymentStatus({ reference }: { reference: string }) {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  useEffect(() => {
    if (!reference) {
      setNotFound(true);
      return;
    }

    let attempts = 0;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function refreshStatus() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(reference)}`, { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 404) setNotFound(true);
          return;
        }

        const result = (await response.json()) as OrderSummary;
        if (stopped) return;
        setOrder(result);

        if (result.status === "PAID") {
          clearCartRef.current();
          return;
        }
        if (result.status === "PAYMENT_FAILED") return;
      } catch {
        // A temporary network issue should not label an unconfirmed payment as successful.
      }

      attempts += 1;
      if (!stopped && attempts < 20) timer = setTimeout(refreshStatus, 3000);
    }

    void refreshStatus();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reference]);

  if (notFound) {
    return (
      <>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">No encontramos el pedido</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Vuelve al carrito para iniciar un nuevo pedido.</p>
        <Link href="/carrito" className="mt-7 inline-flex rounded-md bg-[#172b3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#243f55]">Ir al carrito</Link>
      </>
    );
  }

  const isPaid = order?.status === "PAID";
  const isFailed = order?.status === "PAYMENT_FAILED";

  return (
    <>
      <h1 className="mt-4 text-3xl font-semibold text-slate-950">
        {isPaid ? "Pago de prueba aprobado" : isFailed ? "Pago no aprobado" : "Estamos verificando tu pago"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {isPaid
          ? "Wompi confirmó el pago de Sandbox. No se realizó ningún cobro real."
          : isFailed
            ? "Wompi no aprobó esta transacción de prueba. Puedes volver al carrito e intentarlo de nuevo."
            : "El pago todavía no está confirmado. Esta página se actualizará cuando llegue la confirmación segura de Wompi."}
      </p>
      {order && (
        <div className="mt-7 rounded-xl bg-slate-50 p-5 text-sm">
          <p className="text-slate-500">Referencia del pedido</p>
          <p className="mt-1 font-semibold text-slate-900">{order.reference}</p>
          <p className="mt-4 text-slate-500">Total</p>
          <p className="mt-1 font-semibold text-slate-900">${Math.round(order.totalInCents / 100).toLocaleString("es-CO")} {order.currency}</p>
        </div>
      )}
      {!isPaid && (
        <p aria-live="polite" className="mt-5 text-xs text-slate-500">
          {isFailed ? "El carrito conserva tus productos." : "La redirección de Wompi no confirma por sí sola el pago."}
        </p>
      )}
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href={isPaid ? "/" : "/carrito"} className="inline-flex rounded-md bg-[#172b3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#243f55]">
          {isPaid ? "Volver a la tienda" : "Volver al carrito"}
        </Link>
      </div>
    </>
  );
}
