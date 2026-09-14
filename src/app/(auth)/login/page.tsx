import { Suspense } from "react";
import LoginForm from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta na Raízes de Artemísia."
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}