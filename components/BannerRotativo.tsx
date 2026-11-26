"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BannerRotativoProps = {
  firstMotoImage: string;
  motocarroImage: string;
  motoImage: string;
};

function getBanners({ firstMotoImage, motocarroImage, motoImage }: BannerRotativoProps) {
  return [
  {
    id: 1,
    eyebrow: "ANDINA MOTOR · REPUESTOS",
    title: "La pieza adecuada empieza con una buena referencia.",
    description: "Consulta nuestro catálogo de componentes para motocicletas y vehículos de trabajo.",
    buttonText: "Explorar repuestos",
    buttonHref: "/repuestos",
    image: firstMotoImage,
  },
  {
    id: 2,
    eyebrow: "VEHÍCULOS DE TRABAJO",
    title: "Más capacidad para acompañar tu jornada.",
    description: "Conoce los motocargueros disponibles y revisa sus características.",
    buttonText: "Ver motocargueros",
    buttonHref: "/motocargueros",
    image: motocarroImage,
  },
  {
    id: 3,
    eyebrow: "MOTOCICLETAS",
    title: "Modelos y especificaciones en un mismo catálogo.",
    description: "Compara la información disponible y encuentra una opción para tu día a día.",
    buttonText: "Ver motocicletas",
    buttonHref: "/motos",
    image: motoImage,
  },
  ];
}

export default function BannerRotativo(props: BannerRotativoProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const banners = getBanners(props);
  const activeBanner = banners[current];

  function nextBanner() {
    setCurrent((previous) => (previous === banners.length - 1 ? 0 : previous + 1));
  }

  function previousBanner() {
    setCurrent((previous) => (previous === 0 ? banners.length - 1 : previous - 1));
  }

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextBanner, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="relative overflow-hidden bg-[#172b3d]"
      aria-label="Catálogo Andina Motor"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[460px] sm:h-[520px] lg:h-[590px]">
        <img key={activeBanner.id} src={activeBanner.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#172b3d]/95 via-[#172b3d]/70 to-[#172b3d]/15" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 py-12 sm:px-8 lg:px-12">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">{activeBanner.eyebrow}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{activeBanner.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">{activeBanner.description}</p>
            <Link href={activeBanner.buttonHref} className="mt-8 inline-flex items-center rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
              {activeBanner.buttonText}<span className="ml-3" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <button type="button" onClick={previousBanner} aria-label="Banner anterior" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-xl text-white transition hover:bg-black/50 sm:left-6">←</button>
        <button type="button" onClick={nextBanner} aria-label="Siguiente banner" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-xl text-white transition hover:bg-black/50 sm:right-6">→</button>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {banners.map((banner, index) => (
            <button key={banner.id} type="button" onClick={() => setCurrent(index)} aria-label={`Ir al banner ${index + 1}`} aria-current={current === index} className={`h-2 rounded-full transition-all ${current === index ? "w-8 bg-amber-400" : "w-2 bg-white/55 hover:bg-white"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
