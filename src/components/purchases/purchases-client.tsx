"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createPurchase,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  receivePurchase,
  deletePurchase,
} from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getErrorMessage } from "@/lib/app-error";
import { useToast } from "@/hooks/use-toast";
import { useRequireConnection } from "@/hooks/use-require-connection";
import { useRouter } from "next/navigation";
import { Plus, PackageCheck, Trash2, Pencil } from "lucide-react";

interface PurchasesClientProps {
  purchases: Array<{
    id: string;
    purchaseNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
    supplier: { name: string };
    items: Array<{ quantity: number; product: { name: string }; unitCost: number; total: number }>;
  }>;
  suppliers: Array<{ id: string; name: string; phone: string | null; email: string | null; active: boolean }>;
  products: Array<{ id: string; name: string; costPrice: number }>;
}

export function PurchasesClient({ purchases, suppliers, products }: PurchasesClientProps) {
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<PurchasesClientProps["suppliers"][0] | null>(null);
  const [confirm, setConfirm] = useState<{ type: "purchase" | "supplier"; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);
  const { toast } = useToast();
  const { blockIfOffline, disabled: offlineDisabled } = useRequireConnection();
  const router = useRouter();

  const activeSuppliers = suppliers.filter((s) => s.active);

  const handleSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blockIfOffline("Supplier update")) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      phone: (form.get("phone") as string) || undefined,
      email: (form.get("email") as string) || undefined,
    };
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
        toast({ title: "Supplier updated" });
      } else {
        await createSupplier(data);
        toast({ title: "Supplier created" });
      }
      setSupplierOpen(false);
      setEditingSupplier(null);
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blockIfOffline("Creating a purchase order")) return;
    if (items.length === 0) {
      toast({ title: "Add at least one item", variant: "destructive" });
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createPurchase({
        supplierId: form.get("supplierId") as string,
        items,
        notes: (form.get("notes") as string) || undefined,
      });
      toast({ title: "Purchase order created" });
      setPurchaseOpen(false);
      setItems([]);
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    if (blockIfOffline("Delete operation")) return;
    setLoading(true);
    try {
      if (confirm.type === "purchase") {
        await deletePurchase(confirm.id);
        toast({ title: "Purchase removed", description: "Stock reversed if goods were received." });
      } else {
        await deleteSupplier(confirm.id);
        toast({ title: "Supplier deactivated" });
      }
      setConfirm(null);
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Purchases" description="Manage suppliers and purchase orders">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditingSupplier(null); setSupplierOpen(true); }} disabled={offlineDisabled}>Add Supplier</Button>
          <Button variant="gold" onClick={() => { setItems([]); setPurchaseOpen(true); }} disabled={offlineDisabled}>
            <Plus className="h-4 w-4 mr-1" /> New Purchase
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-4 space-y-3">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{purchase.purchaseNumber}</span>
                      <Badge variant={purchase.status === "RECEIVED" ? "success" : purchase.status === "CANCELLED" ? "destructive" : "warning"}>{purchase.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{purchase.supplier.name} • {formatDate(purchase.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gold">{formatCurrency(purchase.totalAmount)}</span>
                    {purchase.status === "PENDING" && (
                      <Button size="sm" variant="gold" disabled={offlineDisabled} onClick={async () => {
                        if (blockIfOffline("Receiving goods")) return;
                        try {
                          await receivePurchase(purchase.id);
                          router.refresh();
                          toast({ title: "Goods received, stock updated" });
                        } catch (err) {
                          toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
                        }
                      }}>
                        <PackageCheck className="h-4 w-4 mr-1" /> Receive
                      </Button>
                    )}
                    {purchase.status !== "CANCELLED" && (
                      <Button size="sm" variant="ghost" className="text-destructive" disabled={offlineDisabled} onClick={() => setConfirm({ type: "purchase", id: purchase.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4 space-y-3">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {!s.active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.phone || s.email || "—"}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingSupplier(s); setSupplierOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {s.active && (
                    <Button size="icon" variant="ghost" className="text-destructive" disabled={offlineDisabled} onClick={() => setConfirm({ type: "supplier", id: s.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSupplier} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input name="name" required defaultValue={editingSupplier?.name} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input name="phone" defaultValue={editingSupplier?.phone || ""} /></div>
            <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editingSupplier?.email || ""} /></div>
            <Button type="submit" variant="gold" className="w-full" disabled={loading || offlineDisabled}>{editingSupplier ? "Update" : "Create"} Supplier</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-serif">New Purchase Order</DialogTitle></DialogHeader>
          <form onSubmit={handlePurchase} className="space-y-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select name="supplierId" required>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {activeSuppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  if (products.length > 0) setItems([...items, { productId: products[0].id, quantity: 1, unitCost: products[0].costPrice }]);
                }}>Add Item</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select value={item.productId} onValueChange={(v) => {
                    const p = products.find((pr) => pr.id === v);
                    const newItems = [...items];
                    newItems[idx] = { ...newItems[idx], productId: v, unitCost: p?.costPrice || 0 };
                    setItems(newItems);
                  }}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" className="w-20" value={item.quantity} onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = Number(e.target.value);
                    setItems(newItems);
                  }} />
                </div>
              ))}
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input name="notes" /></div>
            <Button type="submit" variant="gold" className="w-full" disabled={loading || offlineDisabled}>Create Purchase Order</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        description={confirm?.type === "purchase" ? "Delete this purchase? Received stock will be reversed." : "Deactivate this supplier?"}
        loading={loading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
