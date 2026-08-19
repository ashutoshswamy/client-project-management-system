"use client";

import { useState } from "react";
import { updateProject } from "@/lib/data";
import type { Project } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ProjectMembers({
  project,
  onUpdated,
}: {
  project: Project;
  onUpdated?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const members = project.members ?? [];

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    if (members.includes(normalized)) {
      toast.error("Already invited");
      return;
    }
    setSubmitting(true);
    try {
      await updateProject(project.id, { members: [...members, normalized] });
      onUpdated?.();
      setEmail("");
      toast.success("Invited to project");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(target: string) {
    await updateProject(project.id, { members: members.filter((m) => m !== target) });
    onUpdated?.();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Members</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={submitting}>
            Invite
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Invited people must already have a sign-in account for this portal.
        </p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <Badge key={m} variant="secondary" className="gap-2">
              {m}
              <button
                type="button"
                onClick={() => handleRemove(m)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${m}`}
              >
                ×
              </button>
            </Badge>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground">No one invited yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
