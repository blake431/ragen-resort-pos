"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { receiptSizeClass } from "@/lib/receipt-types";

interface PrinterTestReceiptProps {
  businessName: string;
  currency: string;
  receiptSize?: string;
}

export function PrinterTestReceipt({
  businessName,
  currency,
  receiptSize,
}: PrinterTestReceiptProps) {
  const now = new Date();

  return (
    <div
      id="printer-test-receipt"
      className={`receipt-thermal mx-auto p-2 ${receiptSizeClass(receiptSize)}`}
    >
      <div className="text-center mb-2">
        <h2 className="text-xs font-bold uppercase">RAGEN RESORT POS</h2>
        <p className="text-[10px] font-semibold mt-0.5">{businessName}</p>
      </div>

      <div className="border-t border-b border-dashed border-gray-500 py-1.5 mb-1.5 text-[10px] text-center">
        <p className="font-bold">Printer Test</p>
        <p>Date: {formatDate(now)}</p>
      </div>

      <table className="w-full mb-1.5 text-[10px]">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-0.5">Item</th>
            <th className="text-center py-0.5 w-7">Qty</th>
            <th className="text-right py-0.5">Amt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-0.5">Sample Item</td>
            <td className="text-center">1</td>
            <td className="text-right">{formatCurrency(0, currency)}</td>
          </tr>
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-500 pt-1 text-[10px]">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(0, currency)}</span>
        </div>
      </div>

      <p className="text-center mt-2 text-[10px] font-semibold border-t border-dashed border-gray-400 pt-1.5">
        Printer test successful
      </p>
    </div>
  );
}
