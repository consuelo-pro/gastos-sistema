import { useEffect, useState } from 'react';
import { getSummary, getTransactions } from '../api.js';
import Balance from './Balance.jsx';
import CategoryBreakdown from './CategoryBreakdown.jsx';
import Ledger from './Ledger.jsx';
import QuickAdd from './QuickAdd.jsx';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return Promise.all([getSummary(), getTransactions({ limit: 30 })]).then(
      ([summaryData, txData]) => {
        setSummary(summaryData);
        setTransactions(txData);
      }
    );
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="page">
      <div className="masthead">
        <h1>Mis cuentas</h1>
        <div className="date">{today}</div>
      </div>

      <QuickAdd onAdded={reload} />

      {loading && <p>Cargando…</p>}

      {!loading && summary && (
        <>
          <Balance totals={summary.totals} />

          <section>
            <h2>Gastos por categoría</h2>
            <CategoryBreakdown byCategory={summary.byCategory} type="gasto" />
          </section>

          <section>
            <h2>Ingresos por categoría</h2>
            <CategoryBreakdown byCategory={summary.byCategory} type="ingreso" />
          </section>

          <section>
            <h2>Movimientos recientes</h2>
            <Ledger transactions={transactions} />
          </section>
        </>
      )}
    </div>
  );
}
