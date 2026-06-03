import { ReportsClient } from "@/components/reports/reports-client";
import { getSettings } from "@/lib/actions/dashboard";

export default async function ReportsPage() {
  const settings = await getSettings();

  return (
    <ReportsClient
      settings={{
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        phone: settings.phone,
        email: settings.email,
      }}
    />
  );
}
