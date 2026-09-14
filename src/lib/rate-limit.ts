// Rate limit simples em memória, por processo. Suficiente pra frear abuso
// básico (ex: spam de cadastro) sem precisar de Redis/serviço externo.
// Limitação conhecida: em ambiente serverless com múltiplas instâncias
// (Vercel), cada instância tem sua própria contagem — não é um limite
// 100% global e "zera" a cada cold start. Pra algo mais rígido no futuro,
// trocar por um serviço externo (Upstash Redis, por exemplo).

const hits = new Map<string, { count: number; resetAt: number }>();

// Limpeza periódica pra não vazar memória com IPs antigos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (entry.resetAt < now) hits.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
