"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClients, getProjects, getInvoices } from "@/lib/data";
import type { Client, Project, Invoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    getClients().then(setClients);
    getProjects().then(setProjects);
    getInvoices().then(setInvoices);
  }, []);

  const ongoing = projects.filter((p) => p.status === "ongoing").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const outstanding = invoices
    .filter((i) => i.status === "unpaid")
    .reduce((sum, i) => sum + invoiceTotal(i).total, 0);
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of clients, projects and invoices.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Clients</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{clients.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Ongoing projects</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{ongoing}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Completed projects</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{completed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(outstanding, profile.currency)}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent projects</h2>
        <div className="flex flex-col gap-2">
          {projects.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-muted"
            >
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{clientName(p.clientId)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{formatCurrency(p.budget, profile.currency)}</span>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
