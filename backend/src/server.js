import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { insertTransaction, listTransactions, getSummary, deleteTransaction } from './db.js';
import { parseExpenseMessage } from './claudeParser.js';

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

// ---------- API para el dashboard ----------

// Carga por texto libre: "gasté 5000 en super" → Claude lo interpreta y se guarda.
app.post('/api/transactions', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Falta el texto del movimiento' });
  }

  try {
    const todayISO = new Date().toISOString().slice(0, 10);
    const parsed = await parseExpenseMessage(text, todayISO);

    if (!parsed.type || !parsed.amount) {
      return res.status(422).json({
        error: 'No entendí que fuera un gasto o ingreso. Probá algo como "gasté 5000 en super" o "cobré 80000 de tal cliente".',
      });
    }

    const saved = await insertTransaction({
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category || 'otros',
      description: parsed.description || null,
      originalMessage: text,
      occurredOn: parsed.occurred_on || null,
      sourcePhone: null,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error procesando movimiento:', err);
    res.status(500).json({ error: 'Hubo un error anotando eso. Probá de nuevo en un rato.' });
  }
});

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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

export default app;
