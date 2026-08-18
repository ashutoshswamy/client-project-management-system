"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addClient, updateClient } from "@/lib/firestore";
import type { Client, ClientInput } from "@/lib/types";
import { toast } from "sonner";

const empty: ClientInput = { name: "", email: "", phone: "", company: "", address: "", notes: "" };

export function ClientFormDialog({
  client,
  trigger,
}: {
  client?: Client;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClientInput>(client ?? empty);
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) setForm(client ?? empty);
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (client) {
        await updateClient(client.id, form);
        toast.success("Client updated");
      } else {
        await addClient(form);
        toast.success("Client added");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle>
            <DialogDescription>Client contact details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
