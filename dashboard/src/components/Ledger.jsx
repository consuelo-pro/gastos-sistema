function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

export default function Ledger({ transactions }) {
  if (transactions.length === 0) {
    return <div className="empty-state">Todavía no registraste nada. Mandá un mensaje por WhatsApp para empezar.</div>;
  }

  return (
    <div>
      {transactions.map((tx) => (
        <div className="ledger-row" key={tx.id}>
          <div className="date-col">{formatDate(tx.occurred_on)}</div>
          <div className="desc-col">
            <div>{tx.description || tx.original_message}</div>
            <div className="category">{tx.category}</div>
          </div>
          <div className={`amount-col ${tx.type === 'ingreso' ? 'income' : 'expense'}`}>
            {tx.type === 'ingreso' ? '+' : '−'}
            {formatMoney(tx.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
