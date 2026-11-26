import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWompiTestEvent } from "@/lib/payments/wompi";

export const runtime = "nodejs";

type TransactionUpdateEvent = {
  event?: string;
  environment?: string;
  data?: {
    transaction?: {
      id?: string;
      reference?: string;
      amount_in_cents?: number;
      currency?: string;
      status?: string;
    };
  };
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
};

export async function POST(request: Request) {
  let event: TransactionUpdateEvent;
  try {
    event = (await request.json()) as TransactionUpdateEvent;
  } catch {
    return NextResponse.json({ error: "Evento no válido." }, { status: 400 });
  }

  const isValid = verifyWompiTestEvent(event, request.headers.get("x-event-checksum"));
  if (!isValid) {
    return NextResponse.json({ error: "No se pudo validar el evento." }, { status: 401 });
  }

  if (event.event !== "transaction.updated") {
    return NextResponse.json({ received: true });
  }

  const transaction = event.data?.transaction;
  if (
    !transaction?.reference ||
    !transaction.id ||
    !Number.isInteger(transaction.amount_in_cents) ||
    transaction.currency !== "COP"
  ) {
    return NextResponse.json({ error: "La transacción está incompleta." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { reference: transaction.reference } });
  if (!order) {
    console.warn("Wompi notificó una referencia sin pedido asociado.");
    return NextResponse.json({ received: true });
  }

  if (order.totalInCents !== transaction.amount_in_cents) {
    return NextResponse.json({ error: "El valor de la transacción no coincide con el pedido." }, { status: 409 });
  }

  const status = transaction.status === "APPROVED"
    ? "PAID"
    : ["DECLINED", "ERROR", "VOIDED"].includes(transaction.status ?? "")
      ? "PAYMENT_FAILED"
      : null;

  if (status && order.status === "PENDING_PAYMENT") {
    await prisma.order.updateMany({
      where: { id: order.id, status: "PENDING_PAYMENT" },
      data: { status, transactionId: transaction.id },
    });
  }

  return NextResponse.json({ received: true });
}
