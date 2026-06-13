export const RECEIPT_PAPER_PRESETS = ["58mm", "80mm", "89mm", "CUSTOM"] as const;
export type ReceiptPaperPreset = (typeof RECEIPT_PAPER_PRESETS)[number];

/** @deprecated use ReceiptPaperPreset */
export const RECEIPT_SIZES = ["58mm", "80mm", "89mm", "CUSTOM"] as const;
export type ReceiptSize = (typeof RECEIPT_SIZES)[number];

export const RECEIPT_ALIGNMENTS = ["LEFT", "CENTER"] as const;
export type ReceiptAlignment = (typeof RECEIPT_ALIGNMENTS)[number];

export const RECEIPT_FONT_SIZES = ["SMALL", "NORMAL", "LARGE", "EXTRA_LARGE"] as const;
export type ReceiptFontSize = (typeof RECEIPT_FONT_SIZES)[number];

export const RECEIPT_SPACING = ["COMPACT", "NORMAL", "SPACIOUS"] as const;
export type ReceiptSpacing = (typeof RECEIPT_SPACING)[number];

export const RECEIPT_PRINT_TARGETS = [
  "receipt",
  "room-sale-receipt",
  "room-invoice",
  "printer-test-receipt",
  "printer-calibration-receipt",
] as const;
export type ReceiptPrintTarget = (typeof RECEIPT_PRINT_TARGETS)[number];

export interface ReceiptLayoutSettings {
  receiptSize?: string | null;
  receiptPaperWidthMm?: number | null;
  receiptPrintableWidthMm?: number | null;
  receiptAlignment?: string | null;
  receiptFontSize?: string | null;
  receiptBoldText?: boolean | null;
  receiptSpacing?: string | null;
  /** @deprecated use receiptSpacing */
  receiptCompact?: boolean | null;
}

export interface ReceiptDimensions {
  paperWidthMm: number;
  printableWidthMm: number;
  preset: ReceiptPaperPreset;
}

export const PRESET_DIMENSIONS: Record<
  Exclude<ReceiptPaperPreset, "CUSTOM">,
  ReceiptDimensions
> = {
  "58mm": { paperWidthMm: 58, printableWidthMm: 54, preset: "58mm" },
  "80mm": { paperWidthMm: 80, printableWidthMm: 76, preset: "80mm" },
  "89mm": { paperWidthMm: 89, printableWidthMm: 85, preset: "89mm" },
};

const MIN_PAPER_WIDTH_MM = 48;
const MAX_PAPER_WIDTH_MM = 100;
const FALLBACK_DIMENSIONS = PRESET_DIMENSIONS["58mm"];

export function normalizeReceiptPaperPreset(size?: string | null): ReceiptPaperPreset {
  if (size === "58mm" || size === "80mm" || size === "89mm" || size === "CUSTOM") {
    return size;
  }
  return "80mm";
}

/** @deprecated use normalizeReceiptPaperPreset */
export function normalizeReceiptSize(size?: string | null): ReceiptSize {
  return normalizeReceiptPaperPreset(size);
}

export function validateReceiptDimensions(
  paperWidthMm: number,
  printableWidthMm: number
): ReceiptDimensions {
  const paper = Math.round(paperWidthMm);
  const printable = Math.round(printableWidthMm);

  if (
    paper < MIN_PAPER_WIDTH_MM ||
    paper > MAX_PAPER_WIDTH_MM ||
    printable <= 0 ||
    printable > paper
  ) {
    return { ...FALLBACK_DIMENSIONS };
  }

  return {
    paperWidthMm: paper,
    printableWidthMm: printable,
    preset: "CUSTOM",
  };
}

export function getPresetDimensions(preset: string): ReceiptDimensions {
  const key = normalizeReceiptPaperPreset(preset);
  if (key === "CUSTOM") {
    return { ...FALLBACK_DIMENSIONS, preset: "CUSTOM" };
  }
  return { ...PRESET_DIMENSIONS[key] };
}

export interface ResolveReceiptDimensionsInput extends ReceiptLayoutSettings {
  forcePaperWidthMm?: number;
  forcePrintableWidthMm?: number;
}

export function resolveReceiptDimensions(
  input: ResolveReceiptDimensionsInput
): ReceiptDimensions {
  if (
    typeof input.forcePaperWidthMm === "number" &&
    typeof input.forcePrintableWidthMm === "number"
  ) {
    return validateReceiptDimensions(
      input.forcePaperWidthMm,
      input.forcePrintableWidthMm
    );
  }

  const preset = normalizeReceiptPaperPreset(input.receiptSize);

  if (preset === "CUSTOM") {
    if (
      typeof input.receiptPaperWidthMm === "number" &&
      typeof input.receiptPrintableWidthMm === "number"
    ) {
      return validateReceiptDimensions(
        input.receiptPaperWidthMm,
        input.receiptPrintableWidthMm
      );
    }
    return { ...FALLBACK_DIMENSIONS };
  }

  return { ...PRESET_DIMENSIONS[preset] };
}

export function normalizeReceiptAlignment(alignment?: string | null): ReceiptAlignment {
  return alignment === "CENTER" ? "CENTER" : "LEFT";
}

export function normalizeReceiptFontSize(fontSize?: string | null): ReceiptFontSize {
  switch (fontSize) {
    case "SMALL":
      return "SMALL";
    case "LARGE":
      return "LARGE";
    case "EXTRA_LARGE":
      return "EXTRA_LARGE";
    default:
      return "NORMAL";
  }
}

export function normalizeReceiptSpacing(
  spacing?: string | null,
  legacyCompact?: boolean | null
): ReceiptSpacing {
  if (spacing === "COMPACT" || spacing === "SPACIOUS") return spacing;
  if (legacyCompact) return "COMPACT";
  return "NORMAL";
}

export function receiptSizeClass(size?: string | null): string {
  switch (normalizeReceiptPaperPreset(size)) {
    case "58mm":
      return "receipt-58mm";
    case "89mm":
      return "receipt-89mm";
    case "CUSTOM":
      return "receipt-custom";
    default:
      return "receipt-80mm";
  }
}

export function receiptPrintSizeClass(size?: string | null): string {
  return receiptSizeClass(size);
}

export function receiptAlignmentClass(alignment?: string | null): string {
  return normalizeReceiptAlignment(alignment) === "CENTER"
    ? "receipt-align-center"
    : "receipt-align-left";
}

export function receiptFontSizeClass(fontSize?: string | null): string {
  switch (normalizeReceiptFontSize(fontSize)) {
    case "SMALL":
      return "receipt-font-small";
    case "LARGE":
      return "receipt-font-large";
    case "EXTRA_LARGE":
      return "receipt-font-xl";
    default:
      return "receipt-font-normal";
  }
}

export function receiptSpacingClass(
  spacing?: string | null,
  legacyCompact?: boolean | null
): string {
  switch (normalizeReceiptSpacing(spacing, legacyCompact)) {
    case "COMPACT":
      return "receipt-spacing-compact";
    case "SPACIOUS":
      return "receipt-spacing-spacious";
    default:
      return "receipt-spacing-normal";
  }
}

export function getReceiptLayoutClasses(
  settings: ReceiptLayoutSettings,
  previewPreset?: ReceiptPaperPreset,
  previewFontSize?: ReceiptFontSize
): string {
  const parts = [
    "receipt-thermal",
    "thermal-receipt-root",
    receiptSizeClass(previewPreset ?? settings.receiptSize),
    receiptAlignmentClass(settings.receiptAlignment),
    receiptFontSizeClass(previewFontSize ?? settings.receiptFontSize),
    receiptSpacingClass(settings.receiptSpacing, settings.receiptCompact),
  ];
  if (settings.receiptBoldText !== false) parts.push("receipt-bold-text");
  return parts.join(" ");
}

export function getReceiptDimensionStyle(
  settings: ReceiptLayoutSettings,
  overrides?: Partial<ResolveReceiptDimensionsInput>
): { width: string; maxWidth: string; minWidth: string } {
  const dims = resolveReceiptDimensions({ ...settings, ...overrides });
  return {
    width: `${dims.printableWidthMm}mm`,
    maxWidth: `${dims.printableWidthMm}mm`,
    minWidth: `${dims.printableWidthMm}mm`,
  };
}

export function getPrintableWidthMm(size?: string | null): number {
  return resolveReceiptDimensions({ receiptSize: size }).printableWidthMm;
}

export function getPaperWidthMm(size?: string | null): number {
  return resolveReceiptDimensions({ receiptSize: size }).paperWidthMm;
}

export function defaultReceiptFontSize(size?: string | null): ReceiptFontSize {
  const preset = normalizeReceiptPaperPreset(size);
  if (preset === "58mm") return "LARGE";
  if (preset === "89mm") return "NORMAL";
  return "NORMAL";
}

export function defaultReceiptSettingsForPreset(preset: ReceiptPaperPreset) {
  const dims = preset === "CUSTOM" ? FALLBACK_DIMENSIONS : PRESET_DIMENSIONS[preset as Exclude<ReceiptPaperPreset, "CUSTOM">];
  return {
    receiptSize: preset,
    receiptPaperWidthMm: dims.paperWidthMm,
    receiptPrintableWidthMm: dims.printableWidthMm,
    receiptAlignment: preset === "58mm" ? "LEFT" : "LEFT",
    receiptFontSize: preset === "58mm" ? "LARGE" : preset === "89mm" ? "NORMAL" : "NORMAL",
    receiptBoldText: true,
  };
}
