"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrinterTestReceipt } from "@/components/settings/printer-test-receipt";
import { ReceiptPrintButton } from "@/components/pos/receipt-print-button";
import {
  detectBluetoothPrinter,
  isWebBluetoothAvailable,
} from "@/lib/print-receipt";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bluetooth, Printer, ScanBarcode } from "lucide-react";

interface HardwareClientProps {
  settings: {
    businessName: string;
    currency: string;
    receiptSize: string;
  };
}

export function HardwareClient({ settings }: HardwareClientProps) {
  const { toast } = useToast();
  const [scannerTest, setScannerTest] = useState("");
  const [bluetoothDetecting, setBluetoothDetecting] = useState(false);
  const webBluetoothAvailable = isWebBluetoothAvailable();

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
              <Printer className="h-5 w-5 text-gold" />
              Print Test Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PrinterTestReceipt
              businessName={settings.businessName}
              currency={settings.currency}
              receiptSize={settings.receiptSize}
            />
            <ReceiptPrintButton
              targetId="printer-test-receipt"
              receiptSize={settings.receiptSize}
              label="Print Test Receipt"
              className="w-full h-12 touch-target"
            />
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm space-y-2">
              <p className="font-medium">How to print on Android</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Pair the Bluetooth printer in Android Settings first.</li>
                <li>Open the POS in Chrome or the installed PWA.</li>
                <li>Tap Print Test Receipt.</li>
                <li>Select the thermal printer from the Android print dialog.</li>
                <li>
                  If the printer does not appear, install the printer&apos;s Android print service or app.
                </li>
              </ol>
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
              <li>Print a test receipt from this page.</li>
              <li>
                Set receipt paper size to 58mm or 80mm in{" "}
                <Link href="/settings" className="text-gold underline">
                  Settings
                </Link>{" "}
                based on your printer paper.
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
