"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { subscribeClients, subscribeProjects, subscribeInvoices, addInvoice } from "@/lib/firestore";
import type { Client, Project, Invoice, InvoiceItem } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

function nextInvoiceNumber(invoices: Invoice[]) {
  const n = invoices.length + 1;
  return `INV-${String(n).padStart(4, "0")}`;
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <NewInvoiceForm />
    </Suspense>
  );
}

function NewInvoiceForm() {
  const router = useRouter();
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const unsubs = [
      subscribeClients(setClients),
      subscribeProjects(setProjects),
      subscribeInvoices(setInvoices),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const initialProjectId = searchParams.get("projectId") ?? "";
  const initialProject = projects.find((p) => p.id === initialProjectId);

  const [clientIdOverride, setClientIdOverride] = useState<string | null>(null);
  const clientId = clientIdOverride ?? initialProject?.clientId ?? "";
  const setClientId = (id: string) => setClientIdOverride(id);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, rate: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  const clientProjects = useMemo(
    () => projects.filter((p) => p.clientId === clientId),
    [projects, clientId]
  );

  function updateItem(index: number, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", qty: 1, rate: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totals = invoiceTotal({ items, taxPercent });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !projectId) {
      toast.error("Select a client and project");
      return;
    }
    setSubmitting(true);
    try {
      const ref = await addInvoice({
        invoiceNumber: nextInvoiceNumber(invoices),
        clientId,
        projectId,
        issueDate,
        dueDate,
        items,
        taxPercent,
        notes,
        status: "unpaid",
      });
      toast.success("Invoice created");
      router.push(`/invoices/${ref.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New invoice</h1>
        <p className="text-sm text-muted-foreground">Bill a client for project work.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Client</Label>
            <Select
              value={clientId}
              onValueChange={(v) => {
                setClientId(v);
                setProjectId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={!clientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {clientProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Line items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="flex min-w-40 flex-1 flex-col gap-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                />
              </div>
              <div className="flex w-20 flex-col gap-2">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={0}
                  value={item.qty}
                  onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                />
              </div>
              <div className="flex w-24 flex-col gap-2 sm:w-28">
                <Label className="text-xs">Rate</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateItem(i, { rate: Number(e.target.value) })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="self-start">
            Add line item
          </Button>

          <div className="flex flex-col gap-2 self-end w-48">
            <Label htmlFor="tax" className="text-xs">
              Tax %
            </Label>
            <Input
              id="tax"
              type="number"
              min={0}
              step="0.01"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col items-end gap-1 border-t pt-3 text-sm">
            <span>Subtotal: {formatCurrency(totals.subtotal, profile.currency)}</span>
            <span>Tax: {formatCurrency(totals.tax, profile.currency)}</span>
            <span className="text-base font-semibold">
              Total: {formatCurrency(totals.total, profile.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </CardContent>
      </Card>

      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Creating..." : "Create invoice"}
      </Button>
    </form>
  );
}
