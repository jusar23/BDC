import { NextResponse } from "next/server";
import { getCrmAccess } from "@/lib/crm-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Kind = "repuesto" | "moto" | "carguero";
type Context = { params: Promise<{ kind: string; id: string }> };
const validKinds: Kind[] = ["repuesto", "moto", "carguero"];
const text = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const numberOrNull = (value: unknown) => value === "" || value == null ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const images = (value: unknown) => Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter((v) => /^https?:\/\//i.test(v)).slice(0, 20) : [];

async function denied() {
  const access = await getCrmAccess();
  if (!access) return NextResponse.json({ error: "No tienes acceso al CRM." }, { status: 401 });
  if (!access.canManageCatalog) return NextResponse.json({ error: "Tu usuario no tiene permiso para gestionar el catálogo." }, { status: 403 });
  return null;
}
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function PATCH(request: Request, { params }: Context) {
  const auth = await denied(); if (auth) return auth;
  const { kind, id: rawId } = await params; const id = Number(rawId);
  if (!validKinds.includes(kind as Kind) || !Number.isInteger(id)) return NextResponse.json({ error: "Registro no válido." }, { status: 400 });
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return NextResponse.json({ error: "Datos no válidos." }, { status: 400 }); }
  const gallery = images(body.gallery);
  try {
    if (kind === "repuesto") {
      const data = { name: text(body.name, 160), reference: text(body.reference, 80), slug: slugify(text(body.slug || body.name, 180)), description: text(body.description), price: numberOrNull(body.price) ?? 0, stock: numberOrNull(body.stock) ?? 0, brand: text(body.brand, 100), category: text(body.category, 100), image: text(body.image, 1000) || gallery[0] || null };
      await prisma.$transaction([prisma.product.update({ where: { id }, data }), prisma.productImage.deleteMany({ where: { productId: id } }), prisma.productImage.createMany({ data: gallery.map((url, position) => ({ productId: id, url, position })) })]);
    } else if (kind === "moto") {
      const data = { brand: text(body.brand, 100) || "Vento", model: text(body.model, 160), slug: slugify(text(body.slug || body.model, 180)), description: text(body.description), price: numberOrNull(body.price), stock: numberOrNull(body.stock) ?? 0, displacement: numberOrNull(body.displacement), engineType: text(body.engineType, 100), transmission: text(body.transmission, 100), warrantyYears: numberOrNull(body.warrantyYears), image: text(body.image, 1000) || gallery[0] || null };
      await prisma.$transaction([prisma.moto.update({ where: { id }, data }), prisma.motoImage.deleteMany({ where: { motoId: id } }), prisma.motoImage.createMany({ data: gallery.map((url, position) => ({ motoId: id, url, position })) })]);
    } else {
      const data = { brand: text(body.brand, 100), model: text(body.model, 160), slug: slugify(text(body.slug || body.model, 180)), description: text(body.description), price: numberOrNull(body.price), stock: numberOrNull(body.stock) ?? 0, engineType: text(body.engineType, 100), displacement: numberOrNull(body.displacement), transmission: text(body.transmission, 100), loadCapacity: numberOrNull(body.loadCapacity), image: text(body.image, 1000) || gallery[0] || null };
      await prisma.$transaction([prisma.motocarro.update({ where: { id }, data }), prisma.motocarroImage.deleteMany({ where: { motocarroId: id } }), prisma.motocarroImage.createMany({ data: gallery.map((url, position) => ({ motocarroId: id, url, position })) })]);
    }
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("CRM update failed", error); return NextResponse.json({ error: "No pudimos guardar los cambios. Revisa que el nombre, el slug y la referencia no estén repetidos." }, { status: 400 }); }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await denied(); if (auth) return auth;
  const { kind, id: rawId } = await params; const id = Number(rawId);
  if (!validKinds.includes(kind as Kind) || !Number.isInteger(id)) return NextResponse.json({ error: "Registro no válido." }, { status: 400 });
  try {
    if (kind === "repuesto") await prisma.product.delete({ where: { id } });
    else if (kind === "moto") await prisma.moto.delete({ where: { id } });
    else await prisma.motocarro.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "No pudimos eliminar este producto." }, { status: 400 }); }
}
