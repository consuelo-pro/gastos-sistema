import { useState } from 'react';
import { addTransaction } from '../api.js';

export default function QuickAdd({ onAdded }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    try {
      const saved = await addTransaction(text.trim());
      setText('');
      onAdded(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder='Ej: "gasté 5000 en super" o "cobré 80000 de fulano"'
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        autoFocus
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Anotando…' : 'Anotar'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
