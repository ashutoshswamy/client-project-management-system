"use client";

import { use, useEffect, useState } from "react";
import { getClients, getProjects, getInvoices, updateInvoice } from "@/lib/data";
import type { Client, Project, Invoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

export default function InvoiceDetailPage(props: PageProps<"/invoices/[id]">) {
  const { id } = use(props.params);
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const refresh = () => {
    getClients().then(setClients);
    getProjects().then(setProjects);
    getInvoices().then(setInvoices);
  };

  useEffect(() => {
    refresh();
  }, []);

  const invoice = invoices.find((i) => i.id === id);
  const client = clients.find((c) => c.id === invoice?.clientId);
  const project = projects.find((p) => p.id === invoice?.projectId);

  if (!invoice) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const totals = invoiceTotal(invoice);

  async function toggleStatus() {
    if (!invoice) return;
    const status = invoice.status === "unpaid" ? "paid" : "unpaid";
    await updateInvoice(invoice.id, { status });
    await refresh();
    toast.success(`Marked as ${status}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{invoice.invoiceNumber}</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={toggleStatus}>
            Mark as {invoice.status === "unpaid" ? "paid" : "unpaid"}
          </Button>
          <Button onClick={() => window.print()}>Download PDF</Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <h2 className="text-xl font-semibold">Invoice {invoice.invoiceNumber}</h2>
            <p className="text-sm text-muted-foreground">
              Issued {invoice.issueDate || "—"} {invoice.dueDate && `· Due ${invoice.dueDate}`}
            </p>
          </div>
          <span className="print:hidden">
            <StatusBadge status={invoice.status} />
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Billed to</p>
            <p className="font-medium">{client?.name}</p>
            <p className="text-sm text-muted-foreground">{client?.company}</p>
            <p className="text-sm text-muted-foreground">{client?.email}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{client?.address}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Project</p>
            <p className="font-medium">{project?.name}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-normal">Description</th>
              <th className="py-2 font-normal text-right">Qty</th>
              <th className="py-2 font-normal text-right">Rate</th>
              <th className="py-2 font-normal text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.qty}</td>
                <td className="py-2 text-right">{formatCurrency(item.rate, profile.currency)}</td>
                <td className="py-2 text-right">
                  {formatCurrency(item.qty * item.rate, profile.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col items-end gap-1 pt-4 text-sm">
          <span>Subtotal: {formatCurrency(totals.subtotal, profile.currency)}</span>
          <span>
            Tax ({invoice.taxPercent}%): {formatCurrency(totals.tax, profile.currency)}
          </span>
          <span className="text-base font-semibold">
            Total: {formatCurrency(totals.total, profile.currency)}
          </span>
        </div>

        {invoice.notes && (
          <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">{invoice.notes}</div>
        )}
      </div>
    </div>
  );
}
