import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lista de palavrões em português (concisa e eficiente)
const PORTUGUESE_SWEAR_WORDS = [
  "porra",
  "merda",
  "bosta",
  "caralho",
  "puta",
  "cu",
  "ânus",
  "cacete",
  "canalha",
  "desgraçado",
  "filho da puta",
  "fdp",
  "foda",
  "fodido",
  "gostar de foder",
  "gota",
  "infame",
  "piranha",
  "vagabundo",
  "viadagem",
  "viado",
];

/**
 * Sanitiza mensagem substituindo palavrões por asteriscos
 * Detecta variações: maiúsculas, acentos, pontuação, números (leet speak)
 */
export function sanitizeMessage(text: string): string {
  let sanitized = text;

  for (const word of PORTUGUESE_SWEAR_WORDS) {
    // Criar regex que detecta: maiúsculas, acentos, números, pontuação
    // Ex: "porra" → "p0rra", "PORRA", "Porra!", "porra.", etc.
    const cleanWord = word
      .normalize("NFD") // Remove acentos
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacríticos

    // Construir padrão regex flexível
    let pattern = "";
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (char === "a" || char === "á" || char === "ã") {
        pattern += "[aáã0]";
      } else if (char === "e" || char === "é") {
        pattern += "[eé3]";
      } else if (char === "i" || char === "í") {
        pattern += "[ií1!]";
      } else if (char === "o" || char === "ó" || char === "õ") {
        pattern += "[oóõ0]";
      } else if (char === "u" || char === "ú") {
        pattern += "[uú]";
      } else if (char === "c") {
        pattern += "[c]";
      } else if (char === "d") {
        pattern += "[d]";
      } else if (char === "f") {
        pattern += "[f]";
      } else if (char === "g") {
        pattern += "[g]";
      } else if (char === "h") {
        pattern += "[h]";
      } else if (char === "l") {
        pattern += "[l]";
      } else if (char === "m") {
        pattern += "[m]";
      } else if (char === "n") {
        pattern += "[n]";
      } else if (char === "p") {
        pattern += "[p]";
      } else if (char === "r") {
        pattern += "[r]";
      } else if (char === "s") {
        pattern += "[s5$]";
      } else if (char === "t") {
        pattern += "[t7]";
      } else if (char === "v") {
        pattern += "[v]";
      } else if (char === "x") {
        pattern += "[x]";
      } else if (char === "z") {
        pattern += "[z2]";
      } else {
        pattern += char;
      }
    }

    // Regex case-insensitive, com possível pontuação antes/depois
    const regex = new RegExp(
      `\\b${pattern}\\b(?![a-záéíóúãõâôç0-9])`,
      "gi"
    );

    const replacement = "*".repeat(word.length);
    sanitized = sanitized.replace(regex, replacement);
  }

  return sanitized;
}

/**
 * Verifica conteúdo grave na OpenAI
 * Retorna true se deve BLOQUEAR (conteúdo grave)
 * Retorna false se pode continuar (ok ou apenas palavrões)
 */
function isSeriousViolation(categories: Record<string, boolean>): boolean {
  // Conteúdo grave que deve ser BLOQUEADO
  const seriousCategories = [
    "violence",
    "violence/graphic",
    "self_harm",
    "self_harm/intent",
    "self_harm/instructions",
    "harassment",
    "harassment/threatening",
    "hate",
    "hate/threatening",
    "illegal",
    "sexual/minors",
    "sexual",
  ];

  return seriousCategories.some((cat) => categories[cat] === true);
}

/**
 * Moderação completa:
 * 1. Detecta e censura palavrões em português
 * 2. Bloqueia conteúdo grave via OpenAI
 */
export async function moderateMessage(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY não configurada.");
    return {
      flagged: false,
      shouldBlock: false,
      sanitized: text,
      error: true,
    };
  }

  try {
    // 1. Chamar OpenAI para detectar conteúdo grave
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];

    console.log("=== MODERAÇÃO OPENAI ===");
    console.log("Mensagem:", text);
    console.log("Flagged:", result.flagged);
    console.log("Categorias:", result.categories);
    console.log("========================");

    // 2. Verificar se tem conteúdo grave
    const hasSerious = isSeriousViolation(result.categories);

    // 3. Sanitizar palavrões em português
    const sanitized = sanitizeMessage(text);

    return {
      flagged: result.flagged,
      categories: result.categories,
      shouldBlock: hasSerious, // Bloquear APENAS conteúdo grave
      sanitized: sanitized, // Texto com palavrões censurados
      error: false,
    };
  } catch (error) {
    console.error("Erro na moderação:", error);
    return {
      flagged: false,
      shouldBlock: false,
      sanitized: text,
      error: true,
    };
  }
}
