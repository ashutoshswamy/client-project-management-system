"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to CPMS</CardTitle>
          <CardDescription>Client & project management portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={submitting} className="mt-2">
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
