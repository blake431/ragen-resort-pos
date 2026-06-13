"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { getPaymentMethodLabel, getTotalPaid } from "@/lib/payments";
import { PaymentMethod } from "@prisma/client";
import { receiptSizeClass } from "@/lib/receipt-types";

interface RoomSaleReceiptProps {
  orderNumber: string;
  completedAt: Date | string;
  cashierName: string;
  roomNumber: string;
  roomType: string;
  customerName: string;
  customerPhone?: string;
  nights: number;
  unitPrice: number;
  total: number;
  changeGiven?: number;
  payments: Array<{ method: string; amount: number; reference?: string | null }>;
  settings: {
    businessName: string;
    businessAddress: string;
    phone: string;
    currency: string;
    receiptFooter?: string;
    receiptSize?: string;
  };
}

export function RoomSaleReceipt({
  orderNumber,
  completedAt,
  cashierName,
  roomNumber,
  roomType,
  customerName,
  customerPhone,
  nights,
  unitPrice,
  total,
  changeGiven = 0,
  payments,
  settings,
}: RoomSaleReceiptProps) {
  const totalPaid = getTotalPaid(
    payments.map((p) => ({ method: p.method as PaymentMethod, amount: p.amount }))
  );

  return (
    <div
      id="room-sale-receipt"
      className={`receipt-thermal mx-auto p-2 ${receiptSizeClass(settings.receiptSize)}`}
    >
      <div className="text-center mb-2 border-b border-dashed border-gray-500 pb-1.5">
        <h2 className="text-xs font-bold uppercase">RAGEN RESORT POS</h2>
        <p className="text-[10px] font-semibold mt-0.5">{settings.businessName}</p>
        <p className="text-[10px] mt-0.5">Room Sale Receipt</p>
        {settings.businessAddress && <p className="text-[10px] mt-0.5">{settings.businessAddress}</p>}
      </div>

      <div className="text-[10px] space-y-0.5 mb-2">
        <p>Receipt: {orderNumber}</p>
        <p>Date: {formatDate(completedAt)}</p>
        <p>Cashier: {cashierName}</p>
      </div>

      <div className="text-[10px] mb-2 border border-dashed border-gray-400 p-1.5">
        <p className="font-semibold">Customer: {customerName}</p>
        {customerPhone && <p>Phone: {customerPhone}</p>}
        <p>Room {roomNumber} — {roomType}</p>
      </div>

      <table className="w-full text-[10px] mb-2">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">Item</th>
            <th className="text-center w-8">Qty</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1">Room {roomNumber} Accommodation</td>
            <td className="text-center">{nights}</td>
            <td className="text-right">{formatCurrency(total, settings.currency)}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-[10px] border-t pt-2 space-y-0.5">
        <div className="flex justify-between">
          <span>Room Rate</span>
          <span>{formatCurrency(unitPrice, settings.currency)}/night</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(total, settings.currency)}</span>
        </div>
      </div>

      <div className="text-[10px] mt-2 border-t pt-1.5">
        <p className="font-semibold mb-0.5">Payment</p>
        {payments.map((p, i) => (
          <div key={i}>
            <div className="flex justify-between">
              <span>{getPaymentMethodLabel(p.method)}</span>
              <span>{formatCurrency(p.amount, settings.currency)}</span>
            </div>
            {p.reference && (
              <p className="text-[9px]">
                {p.method === "MPESA" ? "M-Pesa" : getPaymentMethodLabel(p.method)} Ref: {p.reference}
              </p>
            )}
          </div>
        ))}
        <div className="flex justify-between font-semibold mt-0.5">
          <span>Paid</span>
          <span>{formatCurrency(totalPaid, settings.currency)}</span>
        </div>
        <div className="flex justify-between mt-0.5">
          <span>Change</span>
          <span>{formatCurrency(changeGiven, settings.currency)}</span>
        </div>
      </div>

      {settings.receiptFooter && (
        <p className="text-center text-[10px] text-gray-500 mt-4 pt-2 border-t">{settings.receiptFooter}</p>
      )}
    </div>
  );
}
