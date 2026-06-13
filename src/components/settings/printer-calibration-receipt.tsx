"use client";

import { formatCurrency } from "@/lib/utils";
import {
  getReceiptDimensionStyle,
  getReceiptLayoutClasses,
  resolveReceiptDimensions,
  type ReceiptLayoutSettings,
  type ResolveReceiptDimensionsInput,
} from "@/lib/receipt-types";

interface PrinterCalibrationReceiptProps extends ReceiptLayoutSettings {
  currency?: string;
  calibrationOverrides?: Partial<ResolveReceiptDimensionsInput>;
}

export function PrinterCalibrationReceipt({
  currency = "KES",
  calibrationOverrides,
  ...settings
}: PrinterCalibrationReceiptProps) {
  const dims = resolveReceiptDimensions({ ...settings, ...calibrationOverrides });
  const layout = getReceiptLayoutClasses(settings);
  const style = getReceiptDimensionStyle(settings, calibrationOverrides);

  const rulerMarks: string[] = [];
  for (let mm = 0; mm <= dims.printableWidthMm; mm += 10) {
    rulerMarks.push(`${mm}mm`);
  }

  return (
    <div id="printer-calibration-receipt" className={layout} style={style}>
      <div className="receipt-header">
        <p className="receipt-business-name uppercase">RAGEN RESORT POS</p>
        <p className="receipt-title">Print Calibration Test</p>
      </div>

      <div className="receipt-sep receipt-body">
        <p>Paper width: {dims.paperWidthMm}mm</p>
        <p>Expected printable width: {dims.printableWidthMm}mm</p>
      </div>

      <div className="receipt-sep receipt-body">
        <p className="receipt-title">Width test line</p>
        <div className="receipt-calibration-line" />
        <p className="receipt-calibration-ruler">{rulerMarks.join(" | ")}</p>
      </div>

      <table className="receipt-table receipt-body">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sample Item 1</td>
            <td className="text-right">{formatCurrency(0, currency)}</td>
          </tr>
          <tr>
            <td>Sample Item 2</td>
            <td className="text-right">{formatCurrency(0, currency)}</td>
          </tr>
        </tbody>
      </table>

      <div className="receipt-sep">
        <div className="receipt-between receipt-total">
          <span className="receipt-label">TOTAL</span>
          <span className="receipt-value">{formatCurrency(0, currency)}</span>
        </div>
      </div>

      <div className="receipt-sep receipt-body">
        <p className="receipt-title">Payment</p>
        <div className="receipt-between">
          <span className="receipt-label">Cash</span>
          <span className="receipt-value">{formatCurrency(0, currency)}</span>
        </div>
      </div>

      <p className="receipt-sep receipt-footer text-center">
        Thank you — calibration test complete
      </p>
    </div>
  );
}
