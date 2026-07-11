import { z } from "zod";

/** Regras de senha forte exigidas no cadastro de clientes */
export const passwordSchema = z
  .string()
  .trim()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial");

export const registerSchema = z.object({
  username: z.string().trim().min(3, "Usuário deve ter no mínimo 3 caracteres").max(24),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().trim().min(1, "Informe a senha")
});

/** Pontuação visual de força da senha (0 a 5) usada no medidor do formulário */
export function passwordStrengthScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
