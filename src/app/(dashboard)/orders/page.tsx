import { OrdersClient } from "@/components/orders/orders-client";
import { getOrders } from "@/lib/actions/products";
import { getSettings } from "@/lib/actions/dashboard";

export default async function OrdersPage() {
  try {
    const [orders, settings] = await Promise.all([getOrders(), getSettings()]);
    return (
      <OrdersClient
        orders={orders}
        settings={{
          businessName: settings.businessName,
          businessAddress: settings.businessAddress,
          phone: settings.phone,
          email: settings.email,
          receiptFooter: settings.receiptFooter,
          currency: settings.currency,
          receiptSize: settings.receiptSize,
          receiptPaperWidthMm: settings.receiptPaperWidthMm,
          receiptPrintableWidthMm: settings.receiptPrintableWidthMm,
          receiptAlignment: settings.receiptAlignment,
          receiptFontSize: settings.receiptFontSize,
          receiptBoldText: settings.receiptBoldText,
          receiptSpacing: settings.receiptSpacing,
          receiptCompact: settings.receiptCompact,
        }}
      />
    );
  } catch (error) {
    console.error("[OrdersPage]", error);
    return (
      <OrdersClient
        orders={[]}
        settings={{
          businessName: "RAGEN RESORT",
          businessAddress: "",
          phone: "",
          email: "",
          receiptFooter: "",
          currency: "KES",
          receiptSize: "80mm",
          receiptPaperWidthMm: 80,
          receiptPrintableWidthMm: 76,
          receiptAlignment: "LEFT",
          receiptFontSize: "NORMAL",
          receiptBoldText: true,
          receiptSpacing: "NORMAL",
          receiptCompact: false,
        }}
        loadError="Unable to load orders. Check your connection and refresh."
      />
    );
  }
}
