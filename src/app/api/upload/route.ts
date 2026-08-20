import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth-helpers";

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

    const uploaded = await Promise.all(
      files.map((file) =>
        put(`produtos/${Date.now()}-${file.name}`, file, { access: "public" })
      )
    );

    return NextResponse.json({ urls: uploaded.map((b) => b.url) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
