export const RECEIPT_SIZES = ["58mm", "80mm"] as const;
export type ReceiptSize = (typeof RECEIPT_SIZES)[number];

export const RECEIPT_PRINT_TARGETS = [
  "receipt",
  "room-sale-receipt",
  "room-invoice",
  "printer-test-receipt",
] as const;
export type ReceiptPrintTarget = (typeof RECEIPT_PRINT_TARGETS)[number];

export function normalizeReceiptSize(size?: string | null): ReceiptSize {
  return size === "58mm" ? "58mm" : "80mm";
}

export function receiptSizeClass(size?: string | null): string {
  return normalizeReceiptSize(size) === "58mm" ? "receipt-size-58mm" : "receipt-size-80mm";
}
