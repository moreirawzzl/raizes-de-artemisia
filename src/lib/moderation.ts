import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function moderateMessage(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY não configurada.");

    return {
      flagged: false,
      error: true,
    };
  }

  try {
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];

    return {
      flagged: result.flagged,
      categories: result.categories,
      error: false,
    };
  } catch (error) {
    console.error("Erro na moderação:", error);

    return {
      flagged: false,
      error: true,
    };
  }
}