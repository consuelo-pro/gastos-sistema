function formatMoney(n) {
  return `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export default function CategoryBreakdown({ byCategory, type }) {
  const rows = byCategory.filter((r) => r.type === type).sort((a, b) => b.total - a.total);
  const max = Math.max(...rows.map((r) => Number(r.total)), 1);
  const color = type === 'ingreso' ? 'var(--income)' : 'var(--expense)';

  if (rows.length === 0) {
    return <div className="empty-state">Todavía no hay {type === 'ingreso' ? 'ingresos' : 'gastos'} en este período.</div>;
  }

  return (
    <div>
      {rows.map((row) => (
        <div className="category-row" key={row.category}>
          <div className="name">{row.category}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(Number(row.total) / max) * 100}%`, background: color }}
            />
          </div>
          <div className="amount">{formatMoney(row.total)}</div>
        </div>
      ))}
    </div>
  );
}
