"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { subscribeClients, subscribeProjects, subscribeInvoices } from "@/lib/firestore";
import type { Client, Project, Invoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ClientFormDialog } from "@/components/client-form-dialog";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

export default function ClientDetailPage(props: PageProps<"/clients/[id]">) {
  const { id } = use(props.params);
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

  const client = clients.find((c) => c.id === id);
  const clientProjects = projects.filter((p) => p.clientId === id);
  const clientInvoices = invoices.filter((i) => i.clientId === id);

  if (!client) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-sm text-muted-foreground">{client.company}</p>
        </div>
        <ClientFormDialog client={client} trigger={<Button variant="outline">Edit client</Button>} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span>{client.email || "No email"}</span>
            <span>{client.phone || "No phone"}</span>
            <span>{client.address || "No address"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{client.notes || "—"}</CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Projects</h2>
          <ProjectFormDialog
            clients={clients}
            defaultClientId={client.id}
            trigger={<Button size="sm">Add project</Button>}
          />
        </div>
        <div className="flex flex-col gap-2">
          {clientProjects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-muted"
            >
              <span className="font-medium">{p.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{formatCurrency(p.budget, profile.currency)}</span>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))}
          {clientProjects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects for this client.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Invoices</h2>
        <div className="flex flex-col gap-2">
          {clientInvoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-muted"
            >
              <span className="font-medium">{inv.invoiceNumber}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {formatCurrency(invoiceTotal(inv).total, profile.currency)}
                </span>
                <StatusBadge status={inv.status} />
              </div>
            </Link>
          ))}
          {clientInvoices.length === 0 && (
            <p className="text-sm text-muted-foreground">No invoices for this client.</p>
          )}
        </div>
      </div>
    </div>
  );
}
