"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export function MobileMenu({ isAdmin, isLoggedIn }: { isAdmin: boolean; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/loja", label: "Loja" },
    { href: "/encomendas", label: "Encomendas" },
    { href: "/favoritos", label: "Favoritos" },
    ...(isLoggedIn ? [{ href: "/chat", label: "Mensagens" }, { href: "/perfil", label: "Meu perfil" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="flex h-8 w-8 flex-col items-center justify-center gap-[5px]"
      >
        <span className="h-[1.5px] w-5 bg-verde-principal" />
        <span className="h-[1.5px] w-5 bg-verde-principal" />
        <span className="h-[1.5px] w-5 bg-verde-principal" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/30"
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="fixed right-0 top-0 z-[70] flex h-full w-64 flex-col gap-1 bg-fundo p-6 shadow-xl"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="mb-6 self-end text-xl text-verde-principal"
              >
                ✕
              </button>
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-body text-sm text-verde-principal transition-colors hover:bg-bege-claro"
                >
                  {l.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg bg-verde-principal px-3 py-2.5 text-center font-body text-sm text-white"
                >
                  Entrar
                </Link>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
