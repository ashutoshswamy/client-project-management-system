"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { subscribeClients, subscribeProjects, deleteProject } from "@/lib/firestore";
import type { Client, Project, ProjectStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";

export default function ProjectsPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  useEffect(() => {
    const unsubs = [subscribeClients(setClients), subscribeProjects(setProjects)];
    return () => unsubs.forEach((u) => u());
  }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter]
  );

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    toast.success("Project deleted");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">Track budgets and completion status.</p>
        </div>
        <ProjectFormDialog clients={clients} trigger={<Button>Add project</Button>} />
      </div>

      <Select value={filter} onValueChange={(v) => setFilter(v as ProjectStatus | "all")}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/projects/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
              </TableCell>
              <TableCell>{clientName(p.clientId)}</TableCell>
              <TableCell>{formatCurrency(p.budget, profile.currency)}</TableCell>
              <TableCell>
                <StatusBadge status={p.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ⋯
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ProjectFormDialog
                      project={p}
                      clients={clients}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(p.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No projects match this filter.</p>
      )}
    </div>
  );
}
