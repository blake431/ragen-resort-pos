"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { getPaymentMethodLabel, getTotalPaid } from "@/lib/payments";
import { PaymentMethod, RoomChargeType } from "@prisma/client";
import { receiptSizeClass } from "@/lib/receipt-types";

interface RoomInvoiceProps {
  orderNumber: string;
  completedAt: Date | string;
  cashierName: string;
  guest: { fullName: string; phone: string; email?: string | null };
  room: { number: string; type: string };
  checkIn: Date | string;
  checkOut: Date | string;
  nightsStayed: number;
  roomRate: number;
  accommodationSubtotal: number;
  charges: Array<{
    type: RoomChargeType;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  payments: Array<{ method: string; amount: number; reference?: string | null; createdAt?: Date | string }>;
  grandTotal: number;
  settings: {
    businessName: string;
    businessAddress: string;
    phone: string;
    email: string;
    currency: string;
    receiptSize?: string;
  };
}

const TYPE_LABELS: Record<string, string> = {
  FOOD: "Food",
  DRINKS: "Drinks",
  ALCOHOL: "Alcohol",
  LAUNDRY: "Laundry",
  ROOM_SERVICE: "Room Service",
  EXTRA_SERVICE: "Extra Service",
  DAMAGE: "Damage / Extra",
  OTHER: "Other",
  ACCOMMODATION: "Accommodation",
};

export function RoomInvoice(props: RoomInvoiceProps) {
  const productCharges = props.charges.filter(
    (c) => ["FOOD", "DRINKS", "ALCOHOL", "ROOM_SERVICE"].includes(c.type)
  );
  const manualCharges = props.charges.filter(
    (c) => !["FOOD", "DRINKS", "ALCOHOL", "ROOM_SERVICE", "ACCOMMODATION"].includes(c.type)
  );
  const totalPaid = getTotalPaid(
    props.payments.map((p) => ({ method: p.method as PaymentMethod, amount: p.amount }))
  );
  const balance = Math.max(0, props.grandTotal - totalPaid);

  return (
    <div
      id="room-invoice"
      className={`receipt-thermal mx-auto p-2 ${receiptSizeClass(props.settings.receiptSize)}`}
    >
      <div className="text-center mb-2 border-b border-dashed border-gray-500 pb-1.5">
        <h2 className="text-xs font-bold uppercase">RAGEN RESORT POS</h2>
        <p className="text-[10px] font-semibold mt-0.5">{props.settings.businessName}</p>
        <p className="text-[10px] mt-0.5">Room Checkout Invoice</p>
        {props.settings.businessAddress && (
          <p className="text-[10px] mt-0.5">{props.settings.businessAddress}</p>
        )}
        {props.settings.phone && <p className="text-[10px]">Tel: {props.settings.phone}</p>}
      </div>

      <div className="text-[10px] space-y-0.5 mb-2">
        <p>Invoice: {props.orderNumber}</p>
        <p>Date: {formatDate(props.completedAt)}</p>
        <p>Cashier: {props.cashierName}</p>
      </div>

      <div className="border border-dashed border-gray-400 p-1.5 mb-2 text-[10px]">
        <p className="font-semibold mb-0.5">Guest</p>
        <p>{props.guest.fullName}</p>
        <p>{props.guest.phone}</p>
        {props.guest.email && <p>{props.guest.email}</p>}
      </div>

      <div className="border border-dashed border-gray-400 p-1.5 mb-2 text-[10px]">
        <p className="font-semibold mb-0.5">Room</p>
        <p>Room {props.room.number} — {props.room.type}</p>
        <p>Check-in: {formatDate(props.checkIn)}</p>
        <p>Check-out: {formatDate(props.checkOut)}</p>
        <p>Nights: {props.nightsStayed} × {formatCurrency(props.roomRate, props.settings.currency)}/night</p>
      </div>

      <Section title="Accommodation" items={[
        {
          desc: `Room ${props.room.number} (${props.nightsStayed} night${props.nightsStayed !== 1 ? "s" : ""})`,
          qty: props.nightsStayed,
          total: props.accommodationSubtotal,
        },
      ]} currency={props.settings.currency} />

      {productCharges.length > 0 && (
        <Section
          title="Food / Drinks / Products"
          items={productCharges.map((c) => ({
            desc: c.description,
            qty: c.quantity,
            total: c.total,
          }))}
          currency={props.settings.currency}
        />
      )}

      {manualCharges.length > 0 && (
        <Section
          title="Other Charges"
          items={manualCharges.map((c) => ({
            desc: `${c.description} (${TYPE_LABELS[c.type] ?? c.type})`,
            qty: c.quantity,
            total: c.total,
          }))}
          currency={props.settings.currency}
        />
      )}

      <div className="border-t border-dashed border-gray-500 pt-1.5 mt-2 space-y-0.5 text-[10px]">
        <div className="flex justify-between font-bold">
          <span>Grand Total</span>
          <span>{formatCurrency(props.grandTotal, props.settings.currency)}</span>
        </div>
      </div>

      {props.payments.length > 0 && (
        <div className="mt-2 text-[10px] border-t border-dashed border-gray-500 pt-1.5">
          <p className="font-semibold mb-0.5">Payments</p>
          {props.payments.map((p, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span>{getPaymentMethodLabel(p.method)}</span>
                <span>{formatCurrency(p.amount, props.settings.currency)}</span>
              </div>
              {p.reference && (
                <p className="text-[9px]">
                  {p.method === "MPESA" ? "M-Pesa" : getPaymentMethodLabel(p.method)} Ref: {p.reference}
                </p>
              )}
            </div>
          ))}
          <div className="flex justify-between font-semibold mt-0.5 border-t border-gray-400 pt-0.5">
            <span>Total Paid</span>
            <span>{formatCurrency(totalPaid, props.settings.currency)}</span>
          </div>
          {balance > 0.009 && (
            <div className="flex justify-between font-semibold">
              <span>Balance Due</span>
              <span>{formatCurrency(balance, props.settings.currency)}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-[10px] mt-2 pt-1.5 border-t border-dashed border-gray-400">
        Thank you for staying at {props.settings.businessName}
      </p>
    </div>
  );
}

function Section({
  title,
  items,
  currency,
}: {
  title: string;
  items: { desc: string; qty: number; total: number }[];
  currency: string;
}) {
  return (
    <div className="mb-3">
      <p className="font-semibold text-[10px] mb-0.5">{title}</p>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1">Description</th>
            <th className="text-center w-8">Qty</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="py-0.5 pr-1">{item.desc}</td>
              <td className="text-center">{item.qty}</td>
              <td className="text-right">{formatCurrency(item.total, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
