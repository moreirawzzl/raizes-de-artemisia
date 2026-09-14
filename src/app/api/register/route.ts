import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
// ...dentro do POST, antes do resto da lógica:
const ip = getClientIp(req);
const limit = await checkRateLimit(`register:${ip}`, 5, 60 * 60); // 5 por hora
if (!limit.allowed) {
  return NextResponse.json({ error: "Muitas tentativas de cadastro. Tente novamente mais tarde." }, { status: 429 });
}
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  
  }

  import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

  const { username, email, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return NextResponse.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) return NextResponse.json({ error: "Esse nome de usuário já está em uso." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, hasPassword: true, provider: "credentials", cart: { create: {} } }
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
