import {
  normalizeReceiptSize,
  receiptSizeClass,
  type ReceiptPrintTarget,
} from "@/lib/receipt-types";

export const PRINT_ERROR_MESSAGE =
  "Could not print. Check Bluetooth pairing, printer power, paper, and Android print service.";

function applyPrintClasses(receiptSize: string) {
  const sizeClass = receiptSizeClass(receiptSize);
  document.body.classList.add("thermal-print-mode", sizeClass);
  document.documentElement.classList.add("thermal-print-mode", sizeClass);
}

function removePrintClasses() {
  document.body.classList.remove(
    "thermal-print-mode",
    "receipt-size-58mm",
    "receipt-size-80mm"
  );
  document.documentElement.classList.remove(
    "thermal-print-mode",
    "receipt-size-58mm",
    "receipt-size-80mm"
  );
}

export function printThermalReceipt(
  targetId: ReceiptPrintTarget = "receipt",
  receiptSize?: string | null,
  onError?: (message: string) => void
): boolean {
  if (typeof window === "undefined") {
    onError?.(PRINT_ERROR_MESSAGE);
    return false;
  }

  const el = document.getElementById(targetId);
  if (!el) {
    onError?.(PRINT_ERROR_MESSAGE);
    return false;
  }

  const size = normalizeReceiptSize(receiptSize);

  const cleanup = () => {
    removePrintClasses();
    window.removeEventListener("afterprint", cleanup);
  };

  try {
    applyPrintClasses(size);
    window.addEventListener("afterprint", cleanup);
    window.print();
    return true;
  } catch {
    cleanup();
    onError?.(PRINT_ERROR_MESSAGE);
    return false;
  }
}

export function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export async function detectBluetoothPrinter(): Promise<{
  ok: boolean;
  name?: string;
  error?: string;
}> {
  if (!isWebBluetoothAvailable()) {
    return { ok: false, error: "Web Bluetooth is not available in this browser." };
  }

  try {
    const device = await navigator.bluetooth!.requestDevice({
      acceptAllDevices: true,
      optionalServices: [],
    });
    return { ok: true, name: device.name ?? "Unknown device" };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "NotFoundError") {
      return { ok: false, error: "No Bluetooth device selected." };
    }
    if (name === "SecurityError" || name === "NotAllowedError") {
      return { ok: false, error: "Bluetooth permission denied." };
    }
    return { ok: false, error: "Could not detect Bluetooth printer." };
  }
}
