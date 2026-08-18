"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeClients, subscribeProjects, subscribeInvoices, deleteInvoice } from "@/lib/firestore";
import type { Client, Project, Invoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

export default function InvoicesPage() {
  const { profile } = useAuth();
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

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    await deleteInvoice(id);
    toast.success("Invoice deleted");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Generate and track client invoices.</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">New invoice</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>
                <Link href={`/invoices/${inv.id}`} className="font-medium hover:underline">
                  {inv.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{clientName(inv.clientId)}</TableCell>
              <TableCell>{projectName(inv.projectId)}</TableCell>
              <TableCell>{formatCurrency(invoiceTotal(inv).total, profile.currency)}</TableCell>
              <TableCell>
                <StatusBadge status={inv.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ⋯
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${inv.id}`}>View</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(inv.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {invoices.length === 0 && (
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      )}
    </div>
  );
}
