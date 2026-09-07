import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Interpretás mensajes en español sobre gastos o ingresos personales y los convertís a datos estructurados.

Reglas:
- "type" es "gasto" o "ingreso".
- "amount" es un número positivo (sin símbolo de moneda, sin puntos de miles; usá punto para decimales).
- "category" es una categoría corta en minúscula (ej: "supermercado", "transporte", "servicios", "sueldo", "freelance", "salidas", "salud", "otros"). Si no está claro, usá "otros".
- "description" es una frase corta (menos de 8 palabras) con el detalle, o null si no hay nada más que decir.
- "occurred_on" es la fecha en formato YYYY-MM-DD si el mensaje la menciona (ej: "ayer", "el lunes"); si no dice nada, usá null (se toma la fecha de hoy).
- Si el mensaje no describe un gasto o ingreso real (es un saludo, una pregunta, algo ambiguo), respondé con "type": null.

Respondé SOLO con un objeto JSON, sin texto adicional, sin markdown, con esta forma exacta:
{"type": "gasto" | "ingreso" | null, "amount": number | null, "category": string | null, "description": string | null, "occurred_on": string | null}`;

export async function parseExpenseMessage(text, todayISO) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: `${SYSTEM_PROMPT}\n\nHoy es ${todayISO}.`,
    messages: [{ role: 'user', content: text }],
  });

  const raw = message.content.find((block) => block.type === 'text')?.text ?? '{}';

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('No se pudo parsear la respuesta de Claude:', raw);
    return { type: null };
  }
}
