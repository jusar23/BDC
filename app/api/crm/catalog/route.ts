import { NextResponse } from "next/server";
import { getCrmAccess } from "@/lib/crm-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getCrmAccess())) return NextResponse.json({ error: "No tienes acceso al CRM." }, { status: 401 });
  const [products, motos, motocarros] = await Promise.all([
    prisma.product.findMany({ include: { images: { orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }),
    prisma.moto.findMany({ include: { images: { orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }),
    prisma.motocarro.findMany({ include: { images: { orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }),
  ]);
  const entries = [
    ...products.map((item) => ({ ...item, kind: "repuesto" as const, title: item.name, price: Number(item.price), gallery: item.images.map((image) => image.url) })),
    ...motos.map((item) => ({ ...item, kind: "moto" as const, title: `${item.brand} ${item.model}`, price: Number(item.price ?? 0), gallery: item.images.map((image) => image.url) })),
    ...motocarros.map((item) => ({ ...item, kind: "carguero" as const, title: `${item.brand} ${item.model}`, price: Number(item.price ?? 0), gallery: item.images.map((image) => image.url) })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const access = await getCrmAccess();
  if (!access) return NextResponse.json({ error: "No tienes acceso al CRM." }, { status: 401 });
  if (!access.canManageCatalog) return NextResponse.json({ error: "Tu usuario no tiene permiso para gestionar el catálogo." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Datos no válidos." }, { status: 400 }); }
  const kind = body.kind;
  const clean = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const numeric = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const gallery = Array.isArray(body.gallery) ? body.gallery.filter((value): value is string => typeof value === "string").map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)).slice(0, 20) : [];
  const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    if (kind === "repuesto") {
      const name = clean(body.name, 160); const reference = clean(body.reference, 80);
      if (!name || !reference) return NextResponse.json({ error: "El repuesto requiere nombre y referencia." }, { status: 400 });
      const record = await prisma.product.create({ data: { name, reference, slug: slugify(clean(body.slug || name, 180)), description: clean(body.description), price: numeric(body.price), stock: numeric(body.stock), brand: clean(body.brand, 100), category: clean(body.category, 100), image: clean(body.image, 1000) || gallery[0] || null, images: { create: gallery.map((url, position) => ({ url, position })) } } });
      return NextResponse.json({ id: record.id }, { status: 201 });
    }
    const model = clean(body.model, 160); const brand = clean(body.brand, 100) || (kind === "moto" ? "Vento" : "Vaisand");
    if (!model || !["moto", "carguero"].includes(String(kind))) return NextResponse.json({ error: "Selecciona el tipo y el modelo del vehículo." }, { status: 400 });
    const shared = { brand, model, slug: slugify(clean(body.slug || `${brand}-${model}`, 180)), description: clean(body.description), price: Number.isFinite(Number(body.price)) && body.price !== "" ? Number(body.price) : null, stock: numeric(body.stock), engineType: clean(body.engineType, 100), displacement: Number.isFinite(Number(body.displacement)) && body.displacement !== "" ? Number(body.displacement) : null, transmission: clean(body.transmission, 100), image: clean(body.image, 1000) || gallery[0] || null };
    if (kind === "moto") {
      const record = await prisma.moto.create({ data: { ...shared, images: { create: gallery.map((url, position) => ({ url, position })) } } });
      return NextResponse.json({ id: record.id }, { status: 201 });
    }
    const record = await prisma.motocarro.create({ data: { ...shared, loadCapacity: Number.isFinite(Number(body.loadCapacity)) && body.loadCapacity !== "" ? Number(body.loadCapacity) : null, images: { create: gallery.map((url, position) => ({ url, position })) } } });
    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (error) { console.error("CRM create failed", error); return NextResponse.json({ error: "No pudimos guardar el producto. Revisa que la referencia y la dirección sean únicas." }, { status: 400 }); }
}
