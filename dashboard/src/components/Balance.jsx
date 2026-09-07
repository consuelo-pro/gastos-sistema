function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export default function Balance({ totals }) {
  const income = Number(totals.find((t) => t.type === 'ingreso')?.total || 0);
  const expense = Number(totals.find((t) => t.type === 'gasto')?.total || 0);
  const balance = income - expense;

  return (
    <div className="balance-block">
      <div className="balance-label">Saldo del período</div>
      <div className="balance-figure">{formatMoney(balance)}</div>
      <div className="balance-sub">
        <div>
          <span className="tag income" />
          Ingresos {formatMoney(income)}
        </div>
        <div>
          <span className="tag expense" />
          Gastos {formatMoney(expense)}
        </div>
      </div>
    </div>
  );
}
