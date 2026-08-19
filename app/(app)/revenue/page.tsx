"use client";

import { useEffect, useMemo, useState } from "react";
import { getClients, getInvoices } from "@/lib/data";
import type { Client, Invoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function monthLabel(dateStr: string) {
  if (!dateStr) return "Unscheduled";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function RevenuePage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    getClients().then(setClients);
    getInvoices().then(setInvoices);
  }, []);

  const rows = useMemo(
    () => invoices.map((inv) => ({ inv, total: invoiceTotal(inv).total })),
    [invoices]
  );

  const totalRevenue = rows.filter((r) => r.inv.status === "paid").reduce((s, r) => s + r.total, 0);
  const outstanding = rows.filter((r) => r.inv.status === "unpaid").reduce((s, r) => s + r.total, 0);
  const totalInvoiced = rows.reduce((s, r) => s + r.total, 0);

  const byClient = useMemo(() => {
    const map = new Map<string, { paid: number; unpaid: number }>();
    for (const { inv, total } of rows) {
      const entry = map.get(inv.clientId) ?? { paid: 0, unpaid: 0 };
      if (inv.status === "paid") entry.paid += total;
      else entry.unpaid += total;
      map.set(inv.clientId, entry);
    }
    return Array.from(map.entries())
      .map(([clientId, v]) => ({
        clientId,
        name: clients.find((c) => c.id === clientId)?.name ?? "—",
        ...v,
        total: v.paid + v.unpaid,
      }))
      .sort((a, b) => b.total - a.total);
  }, [rows, clients]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const { inv, total } of rows) {
      if (inv.status !== "paid") continue;
      const label = monthLabel(inv.issueDate);
      map.set(label, (map.get(label) ?? 0) + total);
    }
    return Array.from(map.entries());
  }, [rows]);
  const maxMonth = Math.max(1, ...byMonth.map(([, v]) => v));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Revenue</h1>
        <p className="text-sm text-muted-foreground">Finances across all clients and projects.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Revenue collected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totalRevenue, profile.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(outstanding, profile.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Total invoiced</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totalInvoiced, profile.currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Collected revenue by month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {byMonth.map(([label, value]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-foreground"
                  style={{ width: `${(value / maxMonth) * 100}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right">{formatCurrency(value, profile.currency)}</span>
            </div>
          ))}
          {byMonth.length === 0 && (
            <p className="text-sm text-muted-foreground">No paid invoices yet.</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-medium">Revenue by client</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byClient.map((row) => (
              <TableRow key={row.clientId}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{formatCurrency(row.paid, profile.currency)}</TableCell>
                <TableCell>{formatCurrency(row.unpaid, profile.currency)}</TableCell>
                <TableCell>{formatCurrency(row.total, profile.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {byClient.length === 0 && (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
