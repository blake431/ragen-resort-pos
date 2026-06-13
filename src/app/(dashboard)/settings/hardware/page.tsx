import { HardwareClient } from "@/components/settings/hardware-client";
import { getSettings } from "@/lib/actions/dashboard";

export default async function HardwareSettingsPage() {
  const settings = await getSettings();
  return (
    <HardwareClient
      settings={{
        businessName: settings.businessName,
        currency: settings.currency,
        receiptSize: settings.receiptSize,
        receiptPaperWidthMm: settings.receiptPaperWidthMm,
        receiptPrintableWidthMm: settings.receiptPrintableWidthMm,
        receiptAlignment: settings.receiptAlignment,
        receiptFontSize: settings.receiptFontSize,
        receiptBoldText: settings.receiptBoldText,
        receiptSpacing: settings.receiptSpacing,
        receiptCompact: settings.receiptCompact,
      }}
    />
  );
}
