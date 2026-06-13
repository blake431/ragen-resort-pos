import {
  normalizeReceiptAlignment,
  normalizeReceiptFontSize,
  normalizeReceiptPaperPreset,
  normalizeReceiptSpacing,
  receiptAlignmentClass,
  receiptFontSizeClass,
  receiptPrintSizeClass,
  receiptSpacingClass,
  resolveReceiptDimensions,
  type ReceiptFontSize,
  type ReceiptLayoutSettings,
  type ReceiptPrintTarget,
} from "@/lib/receipt-types";

export const PRINT_ERROR_MESSAGE =
  "Could not print. Check Bluetooth pairing, printer power, paper, and Android print service.";

const PRINT_PAGE_STYLE_ID = "thermal-print-page-size";
const PRINT_LAYOUT_STYLE_ID = "thermal-print-layout-size";
const PORTAL_ID = "thermal-print-portal";

const BODY_PRINT_CLASSES = [
  "thermal-printing",
  "receipt-58mm",
  "receipt-80mm",
  "receipt-89mm",
  "receipt-custom",
  "receipt-align-left",
  "receipt-align-center",
  "receipt-font-small",
  "receipt-font-normal",
  "receipt-font-large",
  "receipt-font-xl",
  "receipt-spacing-compact",
  "receipt-spacing-normal",
  "receipt-spacing-spacious",
  "receipt-bold-text",
  "receipt-compact",
] as const;

export interface PrintReceiptOptions extends ReceiptLayoutSettings {
  targetId?: ReceiptPrintTarget;
  forcePaperWidthMm?: number;
  forcePrintableWidthMm?: number;
  /** @deprecated use forcePaperWidthMm */
  forceSize?: string;
  forceFontSize?: ReceiptFontSize;
  onError?: (message: string) => void;
}

function injectPageStyle(paperWidthMm: number) {
  removePageStyle();
  const style = document.createElement("style");
  style.id = PRINT_PAGE_STYLE_ID;
  style.textContent = `@page { size: ${paperWidthMm}mm auto; margin: 0; }`;
  document.head.appendChild(style);
}

function injectLayoutStyle(paperWidthMm: number, printableWidthMm: number) {
  removeLayoutStyle();
  const style = document.createElement("style");
  style.id = PRINT_LAYOUT_STYLE_ID;
  style.textContent = `
    html.thermal-printing,
    body.thermal-printing {
      width: ${paperWidthMm}mm !important;
      min-width: ${paperWidthMm}mm !important;
      max-width: ${paperWidthMm}mm !important;
    }
    body.thermal-printing #thermal-print-portal {
      width: ${paperWidthMm}mm !important;
      min-width: ${paperWidthMm}mm !important;
      max-width: ${paperWidthMm}mm !important;
    }
    body.thermal-printing .thermal-receipt-root {
      width: ${printableWidthMm}mm !important;
      min-width: ${printableWidthMm}mm !important;
      max-width: ${printableWidthMm}mm !important;
    }
  `;
  document.head.appendChild(style);

  document.documentElement.style.setProperty("--thermal-paper-width", `${paperWidthMm}mm`);
  document.documentElement.style.setProperty(
    "--thermal-printable-width",
    `${printableWidthMm}mm`
  );
}

function removePageStyle() {
  document.getElementById(PRINT_PAGE_STYLE_ID)?.remove();
}

function removeLayoutStyle() {
  document.getElementById(PRINT_LAYOUT_STYLE_ID)?.remove();
  document.documentElement.style.removeProperty("--thermal-paper-width");
  document.documentElement.style.removeProperty("--thermal-printable-width");
}

function applyPrintClasses(options: {
  preset: string;
  alignment: ReturnType<typeof normalizeReceiptAlignment>;
  fontSize: ReceiptFontSize;
  spacing: ReturnType<typeof normalizeReceiptSpacing>;
  bold: boolean;
}) {
  const classes = [
    "thermal-printing",
    receiptPrintSizeClass(options.preset),
    receiptAlignmentClass(options.alignment),
    receiptFontSizeClass(options.fontSize),
    receiptSpacingClass(options.spacing),
  ];
  if (options.bold) classes.push("receipt-bold-text");

  const targets = [document.documentElement, document.body];
  for (const node of targets) {
    node.classList.add(...classes);
  }
}

function removePrintClasses() {
  const targets = [document.documentElement, document.body];
  for (const node of targets) {
    node.classList.remove(...BODY_PRINT_CLASSES);
  }
}

function removePrintPortal() {
  document.getElementById(PORTAL_ID)?.remove();
}

function mountPrintPortal(source: HTMLElement) {
  removePrintPortal();
  const portal = document.createElement("div");
  portal.id = PORTAL_ID;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  portal.appendChild(clone);
  document.body.appendChild(portal);
  return portal;
}

export function printThermalReceipt(options: PrintReceiptOptions = {}): boolean {
  if (typeof window === "undefined") {
    options.onError?.(PRINT_ERROR_MESSAGE);
    return false;
  }

  const targetId = options.targetId ?? "receipt";
  const source = document.getElementById(targetId);
  if (!source) {
    options.onError?.(PRINT_ERROR_MESSAGE);
    return false;
  }

  const preset = normalizeReceiptPaperPreset(
    options.forceSize ?? options.receiptSize
  );
  const dimensions = resolveReceiptDimensions({
    receiptSize: preset,
    receiptPaperWidthMm: options.receiptPaperWidthMm,
    receiptPrintableWidthMm: options.receiptPrintableWidthMm,
    forcePaperWidthMm: options.forcePaperWidthMm,
    forcePrintableWidthMm: options.forcePrintableWidthMm,
  });
  const alignment = normalizeReceiptAlignment(options.receiptAlignment);
  const fontSize = normalizeReceiptFontSize(
    options.forceFontSize ?? options.receiptFontSize
  );
  const spacing = normalizeReceiptSpacing(options.receiptSpacing, options.receiptCompact);
  const bold = options.receiptBoldText !== false;

  const cleanup = () => {
    removePrintPortal();
    removePageStyle();
    removeLayoutStyle();
    removePrintClasses();
    window.removeEventListener("afterprint", cleanup);
  };

  try {
    mountPrintPortal(source);
    injectPageStyle(dimensions.paperWidthMm);
    injectLayoutStyle(dimensions.paperWidthMm, dimensions.printableWidthMm);
    applyPrintClasses({
      preset: dimensions.preset === "CUSTOM" ? "CUSTOM" : dimensions.preset,
      alignment,
      fontSize,
      spacing,
      bold,
    });
    window.addEventListener("afterprint", cleanup);

    requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        cleanup();
        options.onError?.(PRINT_ERROR_MESSAGE);
      }
    });

    return true;
  } catch {
    cleanup();
    options.onError?.(PRINT_ERROR_MESSAGE);
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
