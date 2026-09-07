const GRAPH_URL = 'https://graph.facebook.com/v21.0';

export async function sendWhatsAppMessage(to, text) {
  const url = `${GRAPH_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Error enviando mensaje de WhatsApp:', res.status, errBody);
  }
}

// Extrae el texto y el número de teléfono de un evento entrante del webhook de Meta.
// Devuelve null si el evento no es un mensaje de texto (ej: es una confirmación de lectura).
export function extractIncomingMessage(body) {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (!message || message.type !== 'text') return null;

  return {
    from: message.from,
    text: message.text.body,
  };
}
