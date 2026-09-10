"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [siap, setSiap] = useState(false);
  useEffect(() => setSiap(true), []);

  if (!siap) return <Button variant="ghost" size="icon" className="size-8" disabled aria-hidden />;

  const gelap = resolvedTheme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => setTheme(gelap ? "light" : "dark")}
      aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      {gelap ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
