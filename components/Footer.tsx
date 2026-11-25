import Link from "next/link";

const links = [
  ["Repuestos", "/repuestos"],
  ["Motocargueros", "/motocargueros"],
  ["Motocicletas", "/motos"],
  ["Sobre Andina Motor", "/sobre-nosotros"],
];

export default function Footer() {
  return (
    <footer className="bg-[#172b3d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8 lg:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-500 text-sm font-black text-slate-950">AM</span>
            <span>
              <span className="block text-base font-semibold">Andina Motor</span>
              <span className="mt-0.5 block text-xs text-slate-300">Repuestos y vehículos de trabajo</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
            Un catálogo especializado de repuestos, motocicletas y motocargueros para el trabajo y la movilidad diaria.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">Catálogo</h2>
          <nav aria-label="Enlaces del catálogo" className="mt-5 flex flex-col items-start gap-3">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm text-slate-300 transition hover:text-white">{label}</Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">Información</h2>
          <p className="mt-5 text-sm leading-6 text-slate-300">Consulta las fichas para revisar especificaciones y disponibilidad de cada referencia.</p>
          <Link href="/repuestos" className="mt-5 inline-flex items-center text-sm font-semibold text-white underline decoration-amber-400 decoration-2 underline-offset-4 hover:text-amber-200">
            Explorar productos <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Andina Motor</p>
          <p>Información de catálogo sujeta a disponibilidad.</p>
        </div>
      </div>
    </footer>
  );
}
