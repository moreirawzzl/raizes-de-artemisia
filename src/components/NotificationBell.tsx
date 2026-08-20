"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Notif {
  id: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => { setNotifs(data.notifications || []); setUnread(data.unread || 0); });
  }, [session]);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnread(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-bege-claro">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-verde-principal">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8a4a3a] text-[10px] text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 max-h-96 w-80 overflow-y-auto rounded-xl2 border border-bege-claro bg-white shadow-strong">
          {notifs.length === 0 ? (
            <p className="p-5 text-center text-xs text-verde-secundario">Nenhuma notificação ainda.</p>
          ) : (
            notifs.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/perfil"}
                onClick={() => setOpen(false)}
                className="block border-b border-[#f0ece0] p-4 hover:bg-fundo"
              >
                <p className="text-sm font-semibold text-verde-principal">{n.title}</p>
                <p className="mt-1 text-xs text-[#5c5c50]">{n.body}</p>
                <p className="mt-1 text-[10px] text-bege-escuro">{new Date(n.createdAt).toLocaleString("pt-BR")}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}