import Image from "next/image";
import Link from "next/link";
import { companyInfo } from "@/data/company";

export default function SobreNosotrosPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative isolate overflow-hidden bg-[#172b3d]">
        <Image
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2000&q=85"
          alt="Motocicleta preparada para el camino"
          fill
          priority
          className="-z-20 object-cover opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#172b3d] via-[#172b3d]/90 to-[#172b3d]/35" />
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">{companyInfo.name} · {companyInfo.descriptor}</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{companyInfo.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">{companyInfo.hero.description}</p>
            <Link href="/repuestos" className="mt-8 inline-flex items-center rounded-md bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
              Explorar catálogo <span className="ml-3" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Quiénes somos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{companyInfo.history.title}</h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-slate-600">
          {companyInfo.history.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Nuestra forma de trabajar</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{companyInfo.current.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{companyInfo.current.description}</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-3">
            {companyInfo.values.map((value) => (
              <article key={value.number} className="bg-white p-7 sm:p-8">
                <p className="text-sm font-semibold text-amber-700">{value.number}</p>
                <h3 className="mt-5 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 sm:py-20 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Andina Motor</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Encuentra lo que buscas en nuestro catálogo.</h2>
        </div>
        <Link href="/repuestos" className="inline-flex w-fit rounded-md bg-[#172b3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#243f55]">Ver productos</Link>
      </section>
    </main>
  );
}
