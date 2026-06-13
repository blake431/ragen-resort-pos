"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrinterTestReceipt } from "@/components/settings/printer-test-receipt";
import { PrinterCalibrationReceipt } from "@/components/settings/printer-calibration-receipt";
import { ReceiptPrintButton } from "@/components/pos/receipt-print-button";
import {
  detectBluetoothPrinter,
  isWebBluetoothAvailable,
} from "@/lib/print-receipt";
import { PRESET_DIMENSIONS, type ReceiptLayoutSettings, type ReceiptPaperPreset } from "@/lib/receipt-types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bluetooth, Printer, Ruler, ScanBarcode } from "lucide-react";

interface HardwareClientProps {
  settings: ReceiptLayoutSettings & {
    businessName: string;
    currency: string;
    receiptSize: string;
    receiptPaperWidthMm: number | null;
    receiptPrintableWidthMm: number | null;
    receiptAlignment: string;
    receiptFontSize: string;
    receiptBoldText: boolean;
    receiptSpacing: string;
    receiptCompact: boolean;
  };
}

export function HardwareClient({ settings }: HardwareClientProps) {
  const { toast } = useToast();
  const [scannerTest, setScannerTest] = useState("");
  const [bluetoothDetecting, setBluetoothDetecting] = useState(false);
  const [previewSize, setPreviewSize] = useState<ReceiptPaperPreset>(
    settings.receiptSize === "58mm" || settings.receiptSize === "89mm" || settings.receiptSize === "CUSTOM"
      ? (settings.receiptSize as ReceiptPaperPreset)
      : "80mm"
  );
  const [previewFontSize, setPreviewFontSize] = useState<"NORMAL" | "LARGE">("NORMAL");
  const webBluetoothAvailable = isWebBluetoothAvailable();

  const printSettings = {
    receiptSize: settings.receiptSize,
    receiptPaperWidthMm: settings.receiptPaperWidthMm,
    receiptPrintableWidthMm: settings.receiptPrintableWidthMm,
    receiptAlignment: settings.receiptAlignment,
    receiptFontSize: settings.receiptFontSize,
    receiptBoldText: settings.receiptBoldText,
    receiptSpacing: settings.receiptSpacing,
    receiptCompact: settings.receiptCompact,
  };

  const handleDetectBluetooth = async () => {
    setBluetoothDetecting(true);
    try {
      const result = await detectBluetoothPrinter();
      if (result.ok) {
        toast({
          title: "Bluetooth device detected",
          description: result.name ?? "Device found",
        });
      } else {
        toast({
          title: "Detection failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setBluetoothDetecting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Hardware / Printer"
        description="Configure thermal printers and barcode scanners for Android tablets"
      >
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <Ruler className="h-5 w-5 text-gold" />
              Print Calibration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PrinterCalibrationReceipt currency={settings.currency} {...printSettings} />
            <div className="grid gap-2 sm:grid-cols-2">
              <ReceiptPrintButton
                targetId="printer-calibration-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["58mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["58mm"].printableWidthMm}
                label="Print 58mm Calibration"
                variant="outline"
                className="w-full h-12 touch-target"
              />
              <ReceiptPrintButton
                targetId="printer-calibration-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["80mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["80mm"].printableWidthMm}
                label="Print 80mm Calibration"
                variant="outline"
                className="w-full h-12 touch-target"
              />
              <ReceiptPrintButton
                targetId="printer-calibration-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["89mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["89mm"].printableWidthMm}
                label="Print 89mm / 3.5 inch Calibration"
                variant="outline"
                className="w-full h-12 touch-target"
              />
              <ReceiptPrintButton
                targetId="printer-calibration-receipt"
                {...printSettings}
                label="Print Custom Calibration"
                variant="outline"
                className="w-full h-12 touch-target"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <Printer className="h-5 w-5 text-gold" />
              Print Test Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 no-print">
              <Button
                size="sm"
                variant={previewSize === "58mm" ? "gold" : "outline"}
                onClick={() => setPreviewSize("58mm")}
              >
                Preview 58mm
              </Button>
              <Button
                size="sm"
                variant={previewSize === "80mm" ? "gold" : "outline"}
                onClick={() => setPreviewSize("80mm")}
              >
                Preview 80mm
              </Button>
              <Button
                size="sm"
                variant={previewSize === "89mm" ? "gold" : "outline"}
                onClick={() => setPreviewSize("89mm")}
              >
                Preview 89mm
              </Button>
              <Button
                size="sm"
                variant={previewFontSize === "NORMAL" ? "gold" : "outline"}
                onClick={() => setPreviewFontSize("NORMAL")}
              >
                Preview Normal
              </Button>
              <Button
                size="sm"
                variant={previewFontSize === "LARGE" ? "gold" : "outline"}
                onClick={() => setPreviewFontSize("LARGE")}
              >
                Preview Large
              </Button>
            </div>
            <PrinterTestReceipt
              businessName={settings.businessName}
              currency={settings.currency}
              previewSize={previewSize}
              previewFontSize={previewFontSize}
              {...printSettings}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <ReceiptPrintButton
                targetId="printer-test-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["58mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["58mm"].printableWidthMm}
                forceFontSize="NORMAL"
                label="Print 58mm Test - Normal"
                variant="outline"
                className="w-full h-12 touch-target"
              />
              <ReceiptPrintButton
                targetId="printer-test-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["58mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["58mm"].printableWidthMm}
                forceFontSize="LARGE"
                label="Print 58mm Test - Large"
                variant="outline"
                className="w-full h-12 touch-target"
              />
              <ReceiptPrintButton
                targetId="printer-test-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["80mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["80mm"].printableWidthMm}
                forceFontSize="NORMAL"
                label="Print 80mm Test - Normal"
                variant="outline"
                className="w-full h-12 touch-target"
              />
              <ReceiptPrintButton
                targetId="printer-test-receipt"
                {...printSettings}
                forcePaperWidthMm={PRESET_DIMENSIONS["80mm"].paperWidthMm}
                forcePrintableWidthMm={PRESET_DIMENSIONS["80mm"].printableWidthMm}
                forceFontSize="LARGE"
                label="Print 80mm Test - Large"
                variant="outline"
                className="w-full h-12 touch-target"
              />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm space-y-3">
              <div>
                <p className="font-medium">How to print on Android</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Pair the Bluetooth printer in Android Settings first.</li>
                  <li>Open the POS in Chrome or the installed PWA.</li>
                  <li>Tap a calibration or test print button.</li>
                  <li>Select the thermal printer from the Android print dialog.</li>
                  <li>
                    If the printer does not appear, install the printer&apos;s Android print service or app.
                  </li>
                </ol>
              </div>
              <div>
                <p className="font-medium">If receipt prints too small</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Android print service is likely scaling to A4.</li>
                  <li>Select the correct paper size in the Android print dialog.</li>
                  <li>Turn off Fit to Page.</li>
                  <li>Use Scale 100%.</li>
                  <li>Use Portrait.</li>
                  <li>Use Margins None.</li>
                  <li>Try 58mm first if the printer label says 58mm.</li>
                  <li>Try 89mm only if the actual paper width is around 3.5 inches.</li>
                  <li>
                    If Android does not allow custom paper size, install or use an ESC/POS Bluetooth print service.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Bluetooth Thermal Printer</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Turn the printer on.</li>
              <li>Pair it with the tablet via Bluetooth settings.</li>
              <li>Install the printer service or app if Android cannot see it.</li>
              <li>Print calibration tests from this page and compare the ruler line to real paper.</li>
              <li>
                Set paper size and custom widths in{" "}
                <Link href="/settings" className="text-gold underline">
                  Settings
                </Link>.
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <ScanBarcode className="h-5 w-5 text-gold" />
              Barcode Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Use keyboard mode on the scanner.</li>
              <li>Scan into the test input below.</li>
              <li>If the barcode appears, the scanner is working.</li>
            </ul>
            <div className="space-y-2">
              <Label htmlFor="scanner-test">Scanner test input</Label>
              <Input
                id="scanner-test"
                value={scannerTest}
                onChange={(e) => setScannerTest(e.target.value)}
                placeholder="Scan a barcode here…"
                autoComplete="off"
              />
              {scannerTest && (
                <p className="text-sm text-emerald-400">Scanner working — read: {scannerTest}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <Bluetooth className="h-5 w-5" />
              Experimental: Detect Bluetooth Printer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-200/90 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
              Direct Bluetooth printing is experimental. Use the Android print dialog for production.
            </p>
            {webBluetoothAvailable ? (
              <Button
                variant="outline"
                disabled={bluetoothDetecting}
                onClick={handleDetectBluetooth}
              >
                {bluetoothDetecting ? "Detecting…" : "Detect Bluetooth Printer"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Web Bluetooth is not available in this browser. Use the Android print dialog instead.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
