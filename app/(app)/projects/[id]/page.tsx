"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getClients, getProjects, getInvoices, updateProject } from "@/lib/data";
import type { Client, Project, Invoice } from "@/lib/types";
import { invoiceTotal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { ProjectMembers } from "@/components/project-members";
import { ProjectCommissions } from "@/components/project-commissions";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

export default function ProjectDetailPage(props: PageProps<"/projects/[id]">) {
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

  const project = projects.find((p) => p.id === id);
  const client = clients.find((c) => c.id === project?.clientId);
  const projectInvoices = invoices.filter((i) => i.projectId === id);

  if (!project) return <p className="text-sm text-muted-foreground">Loading...</p>;

  async function toggleStatus() {
    if (!project) return;
    const status = project.status === "ongoing" ? "completed" : "ongoing";
    await updateProject(project.id, { status });
    await refresh();
    toast.success(`Marked as ${status}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {client && (
            <Link href={`/clients/${client.id}`} className="text-sm text-muted-foreground hover:underline">
              {client.name}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={toggleStatus}>
            Mark as {project.status === "ongoing" ? "completed" : "ongoing"}
          </Button>
          <ProjectFormDialog
            project={project}
            clients={clients}
            trigger={<Button variant="outline">Edit</Button>}
            onSaved={refresh}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Budget</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(project.budget, profile.currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={project.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {project.startDate || "—"} → {project.dueDate || "—"}
          </CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{project.description}</CardContent>
        </Card>
      )}

      <ProjectMembers project={project} onUpdated={refresh} />

      <ProjectCommissions project={project} onUpdated={refresh} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Invoices</h2>
          <Button size="sm" asChild>
            <Link href={`/invoices/new?projectId=${project.id}`}>New invoice</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {projectInvoices.map((inv) => (
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
          {projectInvoices.length === 0 && (
            <p className="text-sm text-muted-foreground">No invoices for this project.</p>
          )}
        </div>
      </div>
    </div>
  );
}
