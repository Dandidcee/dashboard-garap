"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushToggle() {
  const [aktif, setAktif] = useState(false);
  const [siap, setSiap] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSiap(true);
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setAktif(!!sub);
    });
  }, []);

  async function nyalakan() {
    setLoading(true);
    try {
      const izin = await Notification.requestPermission();
      if (izin !== "granted") {
        toast.error("Notifikasi ditolak browser. Ubah lewat setelan situs.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error();
      setAktif(true);
      toast.success("Notifikasi menyala di perangkat ini.");
    } catch {
      toast.error("Gagal menyalakan notifikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function matikan() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      await sub?.unsubscribe();
      await fetch("/api/push/subscribe", { method: "DELETE" });
      setAktif(false);
      toast.success("Notifikasi dimatikan.");
    } finally {
      setLoading(false);
    }
  }

  if (!siap) {
    return <p className="text-sm text-muted-foreground">Browser ini gak dukung notifikasi push.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {aktif ? <BellRing className="size-5 text-primary" /> : <BellOff className="size-5 text-muted-foreground" />}
        <div className="flex-1">
          <p className="text-sm font-semibold">{aktif ? "Notifikasi menyala" : "Notifikasi mati"}</p>
          <p className="text-xs text-muted-foreground">Berlaku per perangkat, bukan per akun.</p>
        </div>
        <Button variant={aktif ? "outline" : "default"} size="sm" disabled={loading} onClick={aktif ? matikan : nyalakan}>
          {aktif ? "Matikan" : "Nyalakan"}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={async () => {
          const r = await fetch("/api/cron?test=1");
          toast[r.ok ? "success" : "error"](r.ok ? "Notif percobaan dikirim." : "Gagal mengirim.");
        }}>
          Kirim notif percobaan
        </Button>
      </div>
    </div>
  );
}
