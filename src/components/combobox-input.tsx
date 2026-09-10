"use client";

import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Input teks biasa + saran di bawahnya. Bukan <select> — user tetep bisa
 * ngetik value apapun yang belum ada di daftar (jadi "nambah" itu otomatis,
 * gak perlu tombol tambah terpisah).
 */
export function ComboboxInput({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [fokus, setFokus] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const saran = useMemo(() => {
    const unik = [...new Set(options.filter(Boolean))];
    const q = value.trim().toLowerCase();
    if (!q) return unik;
    return unik.filter((o) => o.toLowerCase().includes(q));
  }, [options, value]);

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { clearTimeout(blurTimer.current); setFokus(true); }}
        onBlur={() => { blurTimer.current = setTimeout(() => setFokus(false), 120); }}
      />
      {fokus && saran.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {saran.map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(o); setFokus(false); }}
              className={cn(
                "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                o === value && "bg-accent/60"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
