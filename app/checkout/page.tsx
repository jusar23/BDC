import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Pedido de prueba</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Datos para tu pedido</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Revisa tus productos y completa los datos de contacto y entrega antes de ir al checkout de Wompi.
        </p>
        <CheckoutForm />
      </div>
    </main>
  );
}
