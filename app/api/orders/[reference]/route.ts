import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  if (!/^AM-[A-F0-9]{20}$/.test(reference)) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  const order = await prisma.order.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      currency: true,
      totalInCents: true,
      items: { select: { productName: true, quantity: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  return NextResponse.json(order, { headers: { "Cache-Control": "no-store" } });
}
