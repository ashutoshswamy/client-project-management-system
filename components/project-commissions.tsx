"use client";

import { useState } from "react";
import { updateProject } from "@/lib/data";
import type { Commission, CommissionType, Project } from "@/lib/types";
import { commissionAmount } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";

export function ProjectCommissions({
  project,
  onUpdated,
}: {
  project: Project;
  onUpdated?: () => void;
}) {
  const { profile } = useAuth();
  const commissions = project.commissions ?? [];
  const [name, setName] = useState("");
  const [type, setType] = useState<CommissionType>("percent");
  const [value, setValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const total = commissions.reduce((sum, c) => sum + commissionAmount(c, project.budget), 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const entry: Commission = { id: crypto.randomUUID(), name: name.trim(), type, value };
    setSubmitting(true);
    try {
      await updateProject(project.id, { commissions: [...commissions, entry] });
      onUpdated?.();
      setName("");
      setValue(0);
      toast.success("Commission added");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    await updateProject(project.id, { commissions: commissions.filter((c) => c.id !== id) });
    onUpdated?.();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Commissions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-40 flex-1 flex-col gap-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex w-32 flex-col gap-2">
            <Select value={type} onValueChange={(v) => setType(v as CommissionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-28 flex-col gap-2">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            Add
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          {commissions.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {c.type === "percent" ? `${c.value}%` : formatCurrency(c.value, profile.currency)}
                </span>
                <span>{formatCurrency(commissionAmount(c, project.budget), profile.currency)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(c.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${c.name}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {commissions.length === 0 && (
            <p className="text-sm text-muted-foreground">No commissions on this project.</p>
          )}
        </div>

        {commissions.length > 0 && (
          <div className="flex justify-between border-t pt-3 text-sm font-medium">
            <span>Total commissions</span>
            <span>{formatCurrency(total, profile.currency)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
