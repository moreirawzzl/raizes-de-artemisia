export interface CheckoutItem {
  name: string;
  quantity: number;
}

/**
 * Monta a mensagem e o link de checkout do WhatsApp seguindo exatamente
 * o formato definido pela marca Raízes de Artemísia.
 */
export function buildWhatsappCheckoutUrl(items: CheckoutItem[], total: string) {
  const numero = process.env.WHATSAPP_NUMBER || "5511978912732";
  const listaProdutos = items.map((i) => `${i.name} (x${i.quantity})`).join(", ");

  const texto =
    `Olá! Fechei meu carrinho no site da Raízes de Artemísia.\n\n` +
    `Produtos:\n${listaProdutos}\n\n` +
    `Valor Total:\n${total}\n\n` +
    `Aguardo a chave PIX para pagamento.`;

  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
