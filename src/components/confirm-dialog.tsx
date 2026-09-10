"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  judul: string;
  deskripsi: string;
  labelKonfirmasi?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{judul}</AlertDialogTitle>
          <AlertDialogDescription>{deskripsi}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {labelKonfirmasi}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
