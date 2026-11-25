import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BannerRotativo from "@/components/BannerRotativo";
import CategorySection from "@/components/CategorySection";
import ProductCard from "@/components/ProductCard";
import MotocarroCard from "@/components/MotocarroCard";
import MotoCard from "@/components/MotoCard";

export default async function Home() {
  const [products, motocarros, motos] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.motocarro.findMany({ orderBy: [{ brand: "asc" }, { model: "asc" }], take: 4 }),
    prisma.moto.findMany({ orderBy: { model: "asc" }, take: 4 }),
  ]);

  const formattedProducts = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
  const formattedMotocarros = motocarros.map((item) => ({
    ...item,
    price: item.price === null ? null : Number(item.price),
    horsepower: item.horsepower === null ? null : Number(item.horsepower),
    fuelTank: item.fuelTank === null ? null : Number(item.fuelTank),
  }));
  const formattedMotos = motos.map((item) => ({
    ...item,
    displacement: item.displacement === null ? null : Number(item.displacement),
    horsepower: item.horsepower === null ? null : Number(item.horsepower),
  }));

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <BannerRotativo />

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 px-6 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {[
            ["Repuestos", "Referencias para el mantenimiento"],
            ["Motocargueros", "Vehículos para mover tu negocio"],
            ["Motos", "Modelos para tu día a día"],
          ].map(([title, description]) => (
            <div key={title} className="py-4 sm:px-6 sm:py-1 first:sm:pl-0 last:sm:pr-0">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <CategorySection />

      <CatalogSection
        eyebrow="Para tu operación"
        title="Motocargueros"
        description="Modelos para labores de carga, reparto y transporte. Revisa sus características y consulta disponibilidad."
        href="/motocargueros"
        linkLabel="Ver catálogo"
      >
        {formattedMotocarros.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {formattedMotocarros.map((item) => <MotocarroCard key={item.id} motocarro={item} />)}
          </div>
        ) : <EmptyCatalog message="Estamos actualizando la selección de motocargueros. Consulta el catálogo completo para recibir información." />}
      </CatalogSection>

      {formattedMotos.length > 0 && (
        <CatalogSection
          eyebrow="Movilidad"
          title="Motocicletas"
          description="Consulta modelos, especificaciones y datos disponibles antes de elegir."
          href="/motos"
          linkLabel="Ver motocicletas"
          muted
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {formattedMotos.map((item) => <MotoCard key={item.id} moto={item} />)}
          </div>
        </CatalogSection>
      )}

      <CatalogSection
        eyebrow="Mantenimiento"
        title="Repuestos seleccionados"
        description="Explora referencias para mantener tu motocicleta o vehículo de trabajo en buenas condiciones."
        href="/repuestos"
        linkLabel="Ver todos los repuestos"
      >
        {formattedProducts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {formattedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : <EmptyCatalog message="El catálogo se está organizando. Vuelve pronto para consultar las referencias disponibles." />}
      </CatalogSection>

      <section className="bg-[#172b3d] px-6 py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Andina Motor</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Una tienda especializada, con todo en un mismo lugar.</h2>
            <p className="mt-4 leading-7 text-slate-300">Conoce nuestro enfoque y la selección de productos que hemos preparado para el trabajo y la movilidad diaria.</p>
          </div>
          <Link href="/sobre-nosotros" className="inline-flex w-fit items-center rounded-md bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
            Conocer Andina Motor <span className="ml-3" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

function CatalogSection({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  muted = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={muted ? "bg-slate-50 px-6 py-16 sm:py-20" : "bg-white px-6 py-16 sm:py-20"}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
          </div>
          <Link href={href} className="shrink-0 text-sm font-semibold text-slate-800 underline decoration-amber-500 decoration-2 underline-offset-4 hover:text-amber-800">{linkLabel} <span aria-hidden="true">→</span></Link>
        </div>
        {children}
      </div>
    </section>
  );
}

function EmptyCatalog({ message }: { message: string }) {
  return <div className="border-y border-slate-200 py-8 text-sm leading-6 text-slate-600">{message}</div>;
}
