"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getPaymentMethodLabel,
  getTotalPaid,
  isSplitOrder,
} from "@/lib/payments";
import { PaymentMethod } from "@prisma/client";
import { receiptSizeClass } from "@/lib/receipt-types";

interface ReceiptProps {
  order: {
    orderNumber: string;
    items: { product: { name: string }; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    changeGiven?: number;
    payments: { method: string; amount: number; reference?: string | null }[];
    user: { name: string };
    createdAt: Date | string;
  };
  settings: {
    businessName: string;
    businessAddress: string;
    phone: string;
    email: string;
    receiptFooter: string;
    currency: string;
    receiptSize?: string;
  };
}

export function Receipt({ order, settings }: ReceiptProps) {
  const changeGiven = order.changeGiven ?? 0;
  const payments = order.payments;
  const totalPaid = getTotalPaid(
    payments.map((p) => ({ method: p.method as PaymentMethod, amount: p.amount }))
  );
  const split = isSplitOrder(
    payments.map((p) => ({ method: p.method as PaymentMethod }))
  );
  const single =
    payments.length === 1 && !split && payments[0].method !== "SPLIT";
  const mpesaPayments = payments.filter((p) => p.method === "MPESA");

  return (
    <div
      id="receipt"
      className={`receipt-thermal mx-auto p-2 ${receiptSizeClass(settings.receiptSize)}`}
    >
      <div className="text-center mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wide">RAGEN RESORT POS</h2>
        <p className="text-[10px] font-semibold mt-0.5">{settings.businessName}</p>
        {settings.businessAddress && <p className="text-[10px] mt-0.5">{settings.businessAddress}</p>}
        {settings.phone && <p className="text-[10px]">Tel: {settings.phone}</p>}
      </div>

      <div className="border-t border-b border-dashed border-gray-500 py-1.5 mb-1.5 text-[10px] space-y-0.5">
        <p>Receipt: {order.orderNumber}</p>
        <p>Date: {formatDate(order.createdAt)}</p>
        <p>Cashier: {order.user.name}</p>
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
          {order.items.map((item, i) => (
            <tr key={i}>
              <td className="py-0.5 pr-1">{item.product.name}</td>
              <td className="text-center py-0.5">{item.quantity}</td>
              <td className="text-right py-0.5">{formatCurrency(item.total, settings.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-500 pt-1.5 space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal, settings.currency)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatCurrency(order.discount, settings.currency)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(order.tax, settings.currency)}</span>
        </div>
        <div className="flex justify-between font-bold text-[11px] pt-1 border-t border-gray-400 mt-1">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total, settings.currency)}</span>
        </div>
      </div>

      <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-500 text-[10px]">
        <p className="font-bold mb-0.5">Payment</p>
        {single ? (
          <>
            <div className="flex justify-between">
              <span>Method</span>
              <span>{getPaymentMethodLabel(payments[0].method)}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid</span>
              <span>{formatCurrency(payments[0].amount, settings.currency)}</span>
            </div>
            {payments[0].reference && (
              <p>
                {getPaymentMethodLabel(payments[0].method)} Ref: {payments[0].reference}
              </p>
            )}
          </>
        ) : (
          <>
            {payments.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span>{getPaymentMethodLabel(p.method)}</span>
                  <span>{formatCurrency(p.amount, settings.currency)}</span>
                </div>
                {p.reference && (
                  <p className="text-[9px]">
                    {getPaymentMethodLabel(p.method)} Ref: {p.reference}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t border-gray-400 mt-1 pt-0.5">
              <span>Total Paid</span>
              <span>{formatCurrency(totalPaid, settings.currency)}</span>
            </div>
          </>
        )}
        {mpesaPayments.length > 0 && mpesaPayments.some((p) => p.reference) && (
          <div className="mt-1 pt-1 border-t border-dotted border-gray-400">
            {mpesaPayments
              .filter((p) => p.reference)
              .map((p, i) => (
                <p key={i}>M-Pesa Ref: {p.reference}</p>
              ))}
          </div>
        )}
        <div className="flex justify-between mt-0.5">
          <span>Change</span>
          <span>{formatCurrency(changeGiven, settings.currency)}</span>
        </div>
      </div>

      {settings.receiptFooter && (
        <p className="text-center mt-2 text-[10px] italic border-t border-dashed border-gray-400 pt-1.5">
          {settings.receiptFooter}
        </p>
      )}
    </div>
  );
}

export { printThermalReceipt as printReceipt } from "@/lib/print-receipt";
