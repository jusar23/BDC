import PaymentStatus from "@/components/checkout/PaymentStatus";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ referencia?: string }>;
}) {
  const { referencia } = await searchParams;

  return (
    <main className="min-h-[60vh] bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Andina Motor · Pedido</p>
        <PaymentStatus reference={referencia ?? ""} />
      </div>
    </main>
  );
}
