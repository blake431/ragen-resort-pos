import { ProductsClient } from "@/components/products/products-client";
import { getAllProductsAdmin, getAllCategories } from "@/lib/actions/products";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getAllProductsAdmin(), getAllCategories()]);
  return <ProductsClient products={products} categories={categories} />;
}
