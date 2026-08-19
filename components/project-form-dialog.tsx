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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addProject, updateProject } from "@/lib/data";
import type { Client, Project, ProjectInput } from "@/lib/types";
import { toast } from "sonner";

function emptyForm(clientId?: string): ProjectInput {
  return {
    clientId: clientId ?? "",
    name: "",
    description: "",
    budget: 0,
    status: "ongoing",
    startDate: "",
    dueDate: "",
    members: [],
    commissions: [],
  };
}

export function ProjectFormDialog({
  project,
  clients,
  defaultClientId,
  trigger,
  onSaved,
}: {
  project?: Project;
  clients: Client[];
  defaultClientId?: string;
  trigger: React.ReactNode;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProjectInput>(project ?? emptyForm(defaultClientId));
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) setForm(project ?? emptyForm(defaultClientId));
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId) {
      toast.error("Select a client");
      return;
    }
    setSubmitting(true);
    try {
      if (project) {
        await updateProject(project.id, form);
        toast.success("Project updated");
      } else {
        await addProject(form);
        toast.success("Project added");
      }
      onSaved?.();
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
            <DialogTitle>{project ? "Edit project" : "Add project"}</DialogTitle>
            <DialogDescription>Project details, budget and status.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label>Client</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm({ ...form, clientId: v })}
                disabled={!!defaultClientId}
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
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                step="0.01"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as ProjectInput["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start date (optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
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
