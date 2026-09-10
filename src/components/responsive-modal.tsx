"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

export function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

/** Dialog di desktop, drawer yang naik dari bawah di HP. */
export function ResponsiveModal({
  open,
  onOpenChange,
  judul,
  deskripsi,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
}) {
  const desktop = useDesktop();

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{judul}</DialogTitle>
            {deskripsi && <DialogDescription>{deskripsi}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{judul}</DrawerTitle>
          {deskripsi && <DrawerDescription>{deskripsi}</DrawerDescription>}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
