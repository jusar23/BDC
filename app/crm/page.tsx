import { redirect } from "next/navigation";
import { getCrmAccess } from "@/lib/crm-auth";
import { prisma } from "@/lib/prisma";
import CrmWorkspace from "@/components/crm/CrmWorkspace";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const access = await getCrmAccess();
  if (!access) redirect("/crm/ingresar");
  const [products, motos, motocarros, orders] = await Promise.all([
    prisma.product.count(), prisma.moto.count(), prisma.motocarro.count(), prisma.order.count(),
  ]);
  return <CrmWorkspace counts={{ products, motos, motocarros, orders }} access={access} />;
}
