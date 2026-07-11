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
