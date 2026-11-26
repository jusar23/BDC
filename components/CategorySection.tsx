import Link from "next/link";

const categories = [
  {
    name: "Motor",
    description: "Repuestos para motor",
    icon: "01",
  },
  {
    name: "Frenos",
    description: "Pastillas, discos y más",
    icon: "02",
  },
  {
    name: "Transmisión",
    description: "Embragues y transmisión",
    icon: "03",
  },
  {
    name: "Suspensión",
    description: "Amortiguadores y piezas",
    icon: "04",
  },
  {
    name: "Eléctrico",
    description: "Baterías y componentes",
    icon: "05",
  },
  {
    name: "Accesorios",
    description: "Accesorios para tu vehículo",
    icon: "06",
  },
];

export default function CategorySection() {
  return (
    <section className="border-b border-slate-200 bg-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/repuestos?categoria=${encodeURIComponent(
                category.name
              )}`}
              className="group rounded-md border border-slate-200 bg-white p-5 text-left transition-colors hover:border-amber-500 hover:bg-amber-50/40"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-100 text-xs font-semibold text-amber-800">
                {category.icon}
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-amber-800">
                {category.name}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-5 sm:hidden">
          <Link
            href="/repuestos"
            className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-[#415b68]"
          >
            Ver todos los repuestos →
          </Link>
        </div>
      </div>
    </section>
  );
}
