import Link from "next/link";

const categories = [
  {
    name: "Motor",
    description: "Repuestos para motor",
    icon: "01",
    image: "https://images.unsplash.com/photo-1645650340424-8e105d862d67?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Frenos",
    description: "Pastillas, discos y más",
    icon: "02",
    image: "https://images.unsplash.com/photo-1603137000613-6833a8002b69?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Transmisión",
    description: "Embragues y transmisión",
    icon: "03",
    image: "https://images.unsplash.com/photo-1769537754999-724044ec2e32?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Suspensión",
    description: "Amortiguadores y piezas",
    icon: "04",
    image: "https://images.unsplash.com/photo-1749655673525-95c0dd4e580b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Eléctrico",
    description: "Baterías y componentes",
    icon: "05",
    image: "https://images.unsplash.com/photo-1687092026359-de6b603c8db7?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accesorios",
    description: "Accesorios para tu vehículo",
    icon: "06",
    image: "https://images.unsplash.com/photo-1689007969725-33d716cc35aa?auto=format&fit=crop&w=900&q=80",
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
              className="group relative isolate flex min-h-44 flex-col justify-end overflow-hidden rounded-md border border-slate-200 bg-slate-900 p-5 text-left transition-colors hover:border-amber-500"
              style={{
                backgroundImage: `url("${category.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-900/55 to-slate-900/20 transition group-hover:from-slate-950/80"
              />

              <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-xs font-semibold text-slate-950">
                {category.icon}
              </div>

              <h3 className="mt-4 text-sm font-semibold text-white">
                {category.name}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-100">
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
