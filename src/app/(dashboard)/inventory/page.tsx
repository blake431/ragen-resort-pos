import { InventoryClient } from "@/components/inventory/inventory-client";
import { getAllProducts, getInventoryMovements, getLowStockProducts } from "@/lib/actions/inventory";
import { getSession } from "@/lib/actions/dashboard";

export default async function InventoryPage() {
  const session = await getSession();
  const [products, movements, lowStock] = await Promise.all([
    getAllProducts(),
    getInventoryMovements(),
    getLowStockProducts(),
  ]);

  return (
    <InventoryClient
      products={products}
      movements={movements}
      lowStock={lowStock}
      isAdmin={session?.user?.role === "ADMIN"}
    />
  );
}
