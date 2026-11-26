import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWompiCheckoutUrl, getWompiTestConfig } from "@/lib/payments/wompi";

export const runtime = "nodejs";

type CheckoutRequest = {
  items?: Array<{ productId?: number; quantity?: number }>;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    region?: string;
  };
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  if (!getWompiTestConfig()) {
    return NextResponse.json(
      { error: "La pasarela de pruebas todavía no está configurada." },
      { status: 503 }
    );
  }

  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "No pudimos leer los datos del pedido." }, { status: 400 });
  }

  const customer = {
    name: cleanText(body.customer?.name, 100),
    email: cleanText(body.customer?.email, 180).toLowerCase(),
    phone: cleanText(body.customer?.phone, 30).replace(/[^0-9+]/g, ""),
    address: cleanText(body.customer?.address, 180),
    city: cleanText(body.customer?.city, 100),
    region: cleanText(body.customer?.region, 100),
  };
  const items = body.items;

  if (
    !customer.name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
    customer.phone.replace(/\D/g, "").length < 7 ||
    !customer.address ||
    !customer.city ||
    !customer.region
  ) {
    return NextResponse.json({ error: "Completa tus datos de contacto y entrega." }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    return NextResponse.json({ error: "El carrito está vacío o tiene demasiados productos." }, { status: 400 });
  }

  const quantities = new Map<number, number>();
  for (const item of items) {
    if (
      !Number.isInteger(item.productId) ||
      !Number.isInteger(item.quantity) ||
      Number(item.productId) < 1 ||
      Number(item.quantity) < 1 ||
      Number(item.quantity) > 99
    ) {
      return NextResponse.json({ error: "El carrito contiene una cantidad no válida." }, { status: 400 });
    }
    quantities.set(Number(item.productId), (quantities.get(Number(item.productId)) ?? 0) + Number(item.quantity));
  }

  const products = await prisma.product.findMany({ where: { id: { in: [...quantities.keys()] } } });
  if (products.length !== quantities.size) {
    return NextResponse.json({ error: "Uno de los productos ya no está disponible." }, { status: 409 });
  }

  const orderItems = [];
  let subtotalInCents = 0;

  for (const product of products) {
    const quantity = quantities.get(product.id)!;
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `No hay existencias suficientes de ${product.name}.` },
        { status: 409 }
      );
    }

    const unitPriceInCents = Math.round(Number(product.price) * 100);
    if (!Number.isSafeInteger(unitPriceInCents) || unitPriceInCents <= 0) {
      return NextResponse.json({ error: `El precio de ${product.name} no es válido.` }, { status: 409 });
    }

    subtotalInCents += unitPriceInCents * quantity;
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productReference: product.reference,
      unitPriceInCents,
      quantity,
    });
  }

  if (!Number.isSafeInteger(subtotalInCents) || subtotalInCents <= 0) {
    return NextResponse.json({ error: "El total del pedido no es válido." }, { status: 400 });
  }

  const reference = `AM-${randomBytes(10).toString("hex").toUpperCase()}`;
  const shippingInCents = 0;

  try {
    const order = await prisma.order.create({
      data: {
        reference,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        shippingCity: customer.city,
        shippingRegion: customer.region,
        subtotalInCents,
        shippingInCents,
        totalInCents: subtotalInCents + shippingInCents,
        items: { create: orderItems },
      },
    });

    const requestUrl = new URL(request.url);
    const redirectUrl = new URL("/pago/resultado", requestUrl.origin);
    redirectUrl.searchParams.set("referencia", reference);

    const checkoutUrl = createWompiCheckoutUrl({
      reference,
      amountInCents: order.totalInCents,
      email: customer.email,
      fullName: customer.name,
      phoneNumber: customer.phone,
      address: customer.address,
      city: customer.city,
      region: customer.region,
      redirectUrl: redirectUrl.toString(),
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("No se pudo preparar el pago de prueba:", error);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Inténtalo de nuevo." }, { status: 500 });
  }
}
