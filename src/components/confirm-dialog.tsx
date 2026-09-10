"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * Dialog konfirmasi terkontrol — dipisah dari trigger-nya (bukan lewat AlertDialogTrigger)
 * biar aman dipakai di dalam DropdownMenuItem, yang nutup dirinya sendiri pas diklik.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  judul,
  deskripsi,
  labelKonfirmasi = "Hapus",
  variant = "destructive",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  judul: string;
  deskripsi: string;
  labelKonfirmasi?: string;
  /** "destructive" buat hapus (merah), "default" buat konfirmasi netral kayak ubah status (warna tema). */
  variant?: "destructive" | "default";
  onConfirm: () => void;
}) {
  const rusak = variant === "destructive";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <span className={cn(
            "mb-1 flex size-10 items-center justify-center self-center rounded-full sm:self-start",
            rusak ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
          )}>
            {rusak ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
          </span>
          <AlertDialogTitle>{judul}</AlertDialogTitle>
          <AlertDialogDescription>{deskripsi}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className={rusak ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            onClick={onConfirm}
          >
            {labelKonfirmasi}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
