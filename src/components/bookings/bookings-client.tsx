"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createBooking,
  createGuest,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  deleteBooking,
} from "@/lib/actions/rooms";
import { formatCurrency, formatDateOnly } from "@/lib/utils";
import { getErrorMessage } from "@/lib/app-error";
import { useToast } from "@/hooks/use-toast";
import { useRequireConnection } from "@/hooks/use-require-connection";
import { useRouter } from "next/navigation";
import { Plus, LogIn, LogOut, X, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface BookingsClientProps {
  bookings: Array<{
    id: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    status: string;
    totalAmount: number;
    guest: { id: string; fullName: string; phone: string };
    room: { number: string; type: string };
  }>;
  guests: Array<{ id: string; fullName: string; phone: string; email: string | null }>;
  rooms: Array<{ id: string; number: string; type: string; status: string; pricePerNight: number }>;
}

export function BookingsClient({ bookings, guests, rooms }: BookingsClientProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<{ action: "cancel" | "delete"; id: string } | null>(null);
  const { toast } = useToast();
  const { blockIfOffline, disabled: offlineDisabled } = useRequireConnection();
  const router = useRouter();

  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");

  const handleGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blockIfOffline("Creating a guest")) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createGuest({
        fullName: form.get("fullName") as string,
        phone: form.get("phone") as string,
        email: (form.get("email") as string) || undefined,
        nationalId: (form.get("nationalId") as string) || undefined,
      });
      toast({ title: "Guest created" });
      setGuestOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blockIfOffline("Creating a booking")) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createBooking({
        guestId: form.get("guestId") as string,
        roomId: form.get("roomId") as string,
        checkIn: new Date(form.get("checkIn") as string),
        checkOut: new Date(form.get("checkOut") as string),
        adults: Number(form.get("adults")),
        children: Number(form.get("children")),
        notes: (form.get("notes") as string) || undefined,
      });
      toast({ title: "Booking created" });
      setBookingOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    RESERVED: "warning",
    CHECKED_IN: "success",
    CHECKED_OUT: "secondary",
    CANCELLED: "destructive",
  };

  return (
    <div>
      <PageHeader title="Bookings" description="Manage guest reservations">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGuestOpen(true)} disabled={offlineDisabled}>Add Guest</Button>
          <Button variant="gold" onClick={() => setBookingOpen(true)} disabled={offlineDisabled}>
            <Plus className="h-4 w-4 mr-1" /> New Booking
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{b.guest.fullName}</span>
                      <Badge variant={statusVariant[b.status]}>{b.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Room {b.room.number} ({b.room.type}) • {b.guest.phone}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateOnly(b.checkIn)} → {formatDateOnly(b.checkOut)} • {b.adults} adults, {b.children} children
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gold mr-2">{formatCurrency(b.totalAmount)}</span>
                    {b.status === "RESERVED" && (
                      <>
                        <Button size="sm" disabled={offlineDisabled} onClick={async () => {
                          if (blockIfOffline("Check-in")) return;
                          await checkInBooking(b.id); router.refresh(); toast({ title: "Checked in" });
                        }}>
                          <LogIn className="h-3 w-3 mr-1" /> Check In
                        </Button>
                        <Button size="sm" variant="destructive" disabled={offlineDisabled} onClick={() => setConfirm({ action: "cancel", id: b.id })}>
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {b.status === "CHECKED_IN" && (
                      <Button size="sm" variant="gold" disabled={offlineDisabled} onClick={async () => {
                        if (blockIfOffline("Check-out")) return;
                        await checkOutBooking(b.id); router.refresh(); toast({ title: "Checked out" });
                      }}>
                        <LogOut className="h-3 w-3 mr-1" /> Check Out
                      </Button>
                    )}
                    {b.status === "CANCELLED" && (
                      <Button size="sm" variant="outline" className="text-destructive" disabled={offlineDisabled} onClick={() => setConfirm({ action: "delete", id: b.id })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-3">
          {bookings.filter((b) => b.status === "CHECKED_IN" || b.status === "RESERVED").map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{b.guest.fullName} — Room {b.room.number}</p>
                  <p className="text-sm text-muted-foreground">{b.status.replace("_", " ")}</p>
                </div>
                <Badge variant={statusVariant[b.status]}>{b.status.replace("_", " ")}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={guestOpen} onOpenChange={setGuestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">Add Guest</DialogTitle></DialogHeader>
          <form onSubmit={handleGuest} className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input name="fullName" required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input name="phone" required /></div>
            <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
            <div className="space-y-2"><Label>National ID / Passport</Label><Input name="nationalId" /></div>
            <Button type="submit" variant="gold" className="w-full" disabled={loading || offlineDisabled}>Create Guest</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">New Booking</DialogTitle></DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="space-y-2">
              <Label>Guest</Label>
              <Select name="guestId" required>
                <SelectTrigger><SelectValue placeholder="Select guest" /></SelectTrigger>
                <SelectContent>
                  {guests.map((g) => <SelectItem key={g.id} value={g.id}>{g.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Select name="roomId" required>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>Room {r.number} — {formatCurrency(r.pricePerNight)}/night</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Check In</Label><Input name="checkIn" type="date" required /></div>
              <div className="space-y-2"><Label>Check Out</Label><Input name="checkOut" type="date" required /></div>
              <div className="space-y-2"><Label>Adults</Label><Input name="adults" type="number" defaultValue={1} min={1} /></div>
              <div className="space-y-2"><Label>Children</Label><Input name="children" type="number" defaultValue={0} min={0} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input name="notes" /></div>
            <Button type="submit" variant="gold" className="w-full" disabled={loading || offlineDisabled}>Create Booking</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        description={confirm?.action === "cancel" ? "Cancel this booking?" : "Permanently delete this cancelled booking?"}
        confirmLabel={confirm?.action === "cancel" ? "Cancel Booking" : "Delete"}
        loading={loading}
        onConfirm={async () => {
          if (!confirm) return;
          if (blockIfOffline(confirm.action === "cancel" ? "Cancelling a booking" : "Deleting a booking")) return;
          setLoading(true);
          try {
            if (confirm.action === "cancel") {
              await cancelBooking(confirm.id);
              toast({ title: "Booking cancelled" });
            } else {
              await deleteBooking(confirm.id);
              toast({ title: "Booking deleted" });
            }
            setConfirm(null);
            router.refresh();
          } catch (err) {
            toast({ title: "Error", description: getErrorMessage(err), variant: "destructive" });
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
