import { prisma } from "@/lib/prisma";
import MotoCard from "@/components/MotoCard";

export default async function MotosPage() {
  const motos = await prisma.moto.findMany({ orderBy: { model: "asc" } });
  const formattedMotos = motos.map((moto) => ({
    ...moto,
    displacement: moto.displacement === null ? null : Number(moto.displacement),
    horsepower: moto.horsepower === null ? null : Number(moto.horsepower),
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-[#172b3d] px-6 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Andina Motor · Motocicletas</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Modelos para la movilidad diaria.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Consulta las motocicletas Vento del catálogo y revisa las especificaciones disponibles para cada modelo.
          </p>
          <p className="mt-8 text-sm text-slate-300">{motos.length} {motos.length === 1 ? "modelo en el catálogo" : "modelos en el catálogo"}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {formattedMotos.length === 0 ? (
          <div className="border-y border-slate-200 py-10">
            <h2 className="text-xl font-semibold">No hay modelos publicados por el momento.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Estamos actualizando la información del catálogo. Revisa nuevamente más adelante.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {formattedMotos.map((moto) => <MotoCard key={moto.id} moto={moto} />)}
          </div>
        )}
      </section>
    </main>
  );
}
