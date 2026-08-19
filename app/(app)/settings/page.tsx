"use client";

import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth-context";
import { saveUserProfile } from "@/lib/data";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, profile, setProfile } = useAuth();
  const [name, setName] = useState(profile.displayName || user?.displayName || "");
  const [currency, setCurrency] = useState(profile.currency || DEFAULT_CURRENCY);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await Promise.all([
        saveUserProfile({ displayName: name, currency }),
        updateProfile(user, { displayName: name }),
      ]);
      setProfile({ displayName: name, currency });
      toast.success("Settings saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account preferences.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Account</CardTitle>
          <CardDescription>{profile.displayName || user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Default currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
