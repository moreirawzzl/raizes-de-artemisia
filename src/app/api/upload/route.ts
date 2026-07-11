import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Upload de imagens de produto.
 *
 * - Na Vercel (produção): usa o Vercel Blob, que persiste de verdade em
 *   ambiente serverless. Ativa sozinho quando a variável BLOB_READ_WRITE_TOKEN
 *   existir (a Vercel cria isso automaticamente ao conectar um Blob Store).
 * - Local (npm run dev): continua salvando em /public/uploads, sem precisar
 *   configurar nada extra pra testar na sua máquina.
 */
export async function POST(req: Request) {
  await requireAdmin();

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const urls: string[] = [];

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    for (const file of files) {
      const fileName = `products/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const blob = await put(fileName, file, { access: "public" });
      urls.push(blob.url);
    }
  } else {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      await writeFile(path.join(uploadDir, fileName), bytes);
      urls.push(`/uploads/${fileName}`);
    }
  }

  return NextResponse.json({ urls });
}
