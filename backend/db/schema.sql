-- Esquema para el sistema de gastos/ingresos
-- Ejecutar una sola vez en tu base de datos Postgres (Supabase, Neon, etc.)

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('gasto', 'ingreso')),
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  original_message TEXT NOT NULL,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_phone TEXT
);

CREATE INDEX IF NOT EXISTS idx_transactions_occurred_on ON transactions (occurred_on);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);

-- Usuario admin simple para el login del dashboard (un solo usuario, vos)
CREATE TABLE IF NOT EXISTS admin_settings (
  id INT PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);
