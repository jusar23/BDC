import { redirect } from "next/navigation";
import { getCrmAccess, isCrmConfigured } from "@/lib/crm-auth";
import CrmLogin from "@/components/crm/CrmLogin";

export const dynamic = "force-dynamic";

export default async function CrmLoginPage() {
  if (await getCrmAccess()) redirect("/crm");
  return <CrmLogin configured={isCrmConfigured()} />;
}
