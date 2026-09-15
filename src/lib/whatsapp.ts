export interface CheckoutItem {
  name: string;
  quantity: number;
}

function getWhatsappNumber() {
  return process.env.WHATSAPP_NUMBER || "5511978002279";
}

/**
 * Monta a mensagem e o link de checkout do WhatsApp seguindo exatamente
 * o formato definido pela marca Raízes de Artemísia.
 */
export function buildWhatsappCheckoutUrl(items: CheckoutItem[], total: string) {
  const numero = getWhatsappNumber();
  const listaProdutos = items.map((i) => `${i.name} (x${i.quantity})`).join(", ");
  const texto =
    `Olá! Fechei meu carrinho no site da Raízes de Artemísia.\n\n` +
    `Produtos:\n${listaProdutos}\n\n` +
    `Valor Total:\n${total}\n\n` +
    `Aguardo a chave PIX para pagamento.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/**
 * Link genérico do WhatsApp da loja (ex: página de Encomendas), usando o
 * mesmo número centralizado do checkout — nunca hardcoded separadamente.
 */
export function buildWhatsappGeneralUrl(message: string) {
  const numero = getWhatsappNumber();
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}
