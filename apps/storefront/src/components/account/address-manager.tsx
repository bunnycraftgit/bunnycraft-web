"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircleIcon, MapPinIcon, PencilIcon, PlusIcon, StarIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations/order";

type Address = ShippingAddressInput & { id: string; isDefault: boolean };

const EMPTY: ShippingAddressInput = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
};

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = React.useState(initialAddresses);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [saving, setSaving] = React.useState(false);

  const form = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: EMPTY,
  });

  function openAdd() {
    setEditing(null);
    form.reset(EMPTY);
    setOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    form.reset(address);
    setOpen(true);
  }

  async function onSubmit(values: ShippingAddressInput) {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/addresses/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setAddresses((prev) => [...prev, created]);
      }
      toast.success("Address saved.");
      setOpen(false);
    } catch {
      toast.error("Couldn't save that address. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    }).catch(() => toast.error("Couldn't update your default address."));
  }

  async function remove(id: string) {
    const prev = addresses;
    setAddresses((p) => p.filter((a) => a.id !== id));
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) {
      setAddresses(prev);
      toast.error("Couldn't remove that address.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Saved Addresses</h2>
        <Button size="sm" variant="outline" onClick={openAdd}>
          <PlusIcon /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
          <MapPinIcon className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="font-medium">{a.fullName}</p>
                {a.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.zip}
                <br />
                {a.country}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => openEdit(a)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <PencilIcon className="size-3" /> Edit
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <StarIcon className="size-3" /> Make default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  className="flex items-center gap-1 text-xs font-medium text-destructive hover:text-destructive/80"
                >
                  <TrashIcon className="size-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <LoaderCircleIcon className="animate-spin" />}
                  Save address
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
