"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null as { error?: string } | null);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form action={action} className="w-full max-w-sm space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Rekap Airdrop</h1>
          <p className="text-sm text-muted-foreground">Masukin password buat buka dashboard.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoFocus autoComplete="current-password" />
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Membuka..." : "Masuk"}
        </Button>
      </form>
    </main>
  );
}
