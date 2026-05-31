import { OrdersClient } from "@/components/orders/orders-client";
import { getOrders } from "@/lib/actions/products";

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrdersClient orders={orders} />;
}
