import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth-helpers";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Máximo de 10 arquivos por envio" }, { status: 400 });
    }

    const isAdmin = (user as any).role === "ADMIN";
    const uploadPrefix = isAdmin ? "produtos" : `avatars/${(user as any).id}`;

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de arquivo inválido (${file.type}). Apenas imagens JPG, PNG, WEBP e AVIF são permitidas.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `O arquivo ${file.name} excede o limite de 5MB.` },
          { status: 400 }
        );
      }
    }

    const uploaded = await Promise.all(
      files.map((file) => {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        return put(`${uploadPrefix}/${Date.now()}-${sanitizedName}`, file, { access: "public" });
      })
    );

    return NextResponse.json({ urls: uploaded.map((b) => b.url) });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
