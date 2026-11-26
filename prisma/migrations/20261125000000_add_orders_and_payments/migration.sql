CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED');

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "paymentProvider" TEXT NOT NULL DEFAULT 'wompi',
  "transactionId" TEXT,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "shippingAddress" TEXT NOT NULL,
  "shippingCity" TEXT NOT NULL,
  "shippingRegion" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'COP',
  "subtotalInCents" INTEGER NOT NULL,
  "shippingInCents" INTEGER NOT NULL DEFAULT 0,
  "totalInCents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" INTEGER NOT NULL,
  "productName" TEXT NOT NULL,
  "productSlug" TEXT NOT NULL,
  "productReference" TEXT NOT NULL,
  "unitPriceInCents" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,

  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");
CREATE UNIQUE INDEX "Order_transactionId_key" ON "Order"("transactionId");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
