import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { insertTransaction, listTransactions, getSummary, deleteTransaction } from './db.js';
import { parseExpenseMessage } from './claudeParser.js';
import { sendWhatsAppMessage, extractIncomingMessage } from './whatsapp.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ---------- Auth simple para el dashboard (un solo usuario: vos) ----------

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'No autorizado' });
  }
}

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

// ---------- Webhook de WhatsApp ----------

// Meta llama a esto una vez para verificar que el webhook es tuyo
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Meta manda acá cada mensaje entrante
app.post('/webhook', async (req, res) => {
  // Le respondemos rápido a Meta para que no reintente; procesamos después.
  res.sendStatus(200);

  const incoming = extractIncomingMessage(req.body);
  if (!incoming) return;

  const { from, text } = incoming;

  try {
    const todayISO = new Date().toISOString().slice(0, 10);
    const parsed = await parseExpenseMessage(text, todayISO);

    if (!parsed.type || !parsed.amount) {
      await sendWhatsAppMessage(
        from,
        'No entendí que fuera un gasto o ingreso. Probá algo como "gasté 5000 en super" o "cobré 80000 de tal cliente".'
      );
      return;
    }

    const saved = await insertTransaction({
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category || 'otros',
      description: parsed.description || null,
      originalMessage: text,
      occurredOn: parsed.occurred_on || null,
      sourcePhone: from,
    });

    const fecha = new Date(saved.occurred_on).toLocaleDateString('es-AR');
    await sendWhatsAppMessage(
      from,
      `Anotado: ${saved.type} $${Number(saved.amount).toLocaleString('es-AR')} en ${saved.category}, ${fecha}.`
    );
  } catch (err) {
    console.error('Error procesando mensaje entrante:', err);
    await sendWhatsAppMessage(from, 'Hubo un error anotando eso. Probá de nuevo en un rato.');
  }
});

// ---------- API para el dashboard ----------

app.get('/api/transactions', requireAuth, async (req, res) => {
  const { from, to, type, category } = req.query;
  const rows = await listTransactions({ from, to, type, category });
  res.json(rows);
});

app.get('/api/summary', requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const summary = await getSummary({ from, to });
  res.json(summary);
});

app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  await deleteTransaction(req.params.id);
  res.sendStatus(204);
});

app.get('/', (req, res) => res.send('Sistema de gastos: backend funcionando.'));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
