// Considera "online" quem bateu heartbeat nos últimos 2 minutos.
// O heartbeat do cliente roda a cada 45s (ver HeartbeatProvider), então isso
// dá folga pra 1-2 batidas perdidas sem marcar como offline errado.
export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function isOnline(lastSeenAt: string | Date | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const last = typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
  return Date.now() - last.getTime() < ONLINE_THRESHOLD_MS;
}

/** "há 5 min", "há 2h", "há 3 dias", "nunca" etc. */
export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "nunca acessou";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 30) return "agora mesmo";
  if (diffSec < 60) return `há ${diffSec} seg`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;

  const diffDays = Math.floor(diffH / 24);
  if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `há ${diffMonths} ${diffMonths > 1 ? "meses" : "mês"}`;

  const diffYears = Math.floor(diffMonths / 12);
  return `há ${diffYears} ano${diffYears > 1 ? "s" : ""}`;
}

export function formatMoney(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Converte string de máscara "1.234,56" para número 1234.56 */
export function parseMaskedMoney(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  return (parseInt(digits || "0", 10)) / 100;
}

/** Aplica máscara estilo campo de valor Pix enquanto o usuário digita */
export function maskMoneyInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits === "") digits = "0";
  digits = digits.replace(/^0+(?=\d)/, "");
  while (digits.length < 3) digits = "0" + digits;
  const cents = digits.slice(-2);
  const reais = digits.slice(0, -2);
  return parseInt(reais, 10).toLocaleString("pt-BR") + "," + cents;
}
