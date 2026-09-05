import OpenAI from "openai";

// Criar cliente OpenAI lazily (apenas quando necessário)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Lista de termos e palavrões a serem sanitizados
const PORTUGUESE_SWEAR_WORDS = [
  "porra",
  "merda",
  "bosta",
  "caralho",
  "puta",
  "puto",
  "cu",
  "cacete",
  "canalha",
  "desgraçado",
  "desgraçada",
  "filho da puta",
  "filha da puta",
  "fdp",
  "foda",
  "fodido",
  "fodida",
  "foder",
  "piranha",
  "vagabundo",
  "vagabunda",
  "viadagem",
  "viado",
  "arrombado",
  "arrombada",
  "babaca"
];

/**
 * Sanitiza mensagem substituindo palavrões por asteriscos
 * Detecta variações: maiúsculas, acentos, pontuação, números (leet speak)
 */
export function sanitizeMessage(text: string): string {
  if (!text) return "";
  let sanitized = text;

  // Ordenar da expressão mais longa para a mais curta (ex: "filho da puta" antes de "puta")
  const sortedWords = [...PORTUGUESE_SWEAR_WORDS].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    const cleanWord = word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    let pattern = "";
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (char === " ") {
        pattern += "\\s+";
      } else if (char === "a") {
        pattern += "[aáàâãä@04]";
      } else if (char === "e") {
        pattern += "[eéèêë3]";
      } else if (char === "i") {
        pattern += "[iíìîï1!|]";
      } else if (char === "o") {
        pattern += "[oóòôõö0]";
      } else if (char === "u") {
        pattern += "[uúùûü]";
      } else if (char === "c") {
        pattern += "[cç]";
      } else if (char === "s") {
        pattern += "[s5$]";
      } else if (char === "t") {
        pattern += "[t7]";
      } else if (char === "z") {
        pattern += "[z2]";
      } else {
        pattern += char;
      }
    }

    const regex = new RegExp(`(?<![a-záéíóúãõâêîôûç0-9])${pattern}(?![a-záéíóúãõâêîôûç0-9])`, "gi");
    sanitized = sanitized.replace(regex, (match) => "*".repeat(match.length));
  }

  return sanitized;
}

/**
 * Verifica conteúdo grave na OpenAI
 * Retorna true se deve BLOQUEAR (conteúdo grave)
 * Retorna false se pode continuar (ok ou apenas palavrões)
 */
function isSeriousViolation(categories: any): boolean {
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
    const client = getOpenAIClient();
    const response = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];

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
