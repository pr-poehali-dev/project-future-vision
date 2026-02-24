
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  balance NUMERIC(12,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tariff_name VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  min_daily NUMERIC(5,3) NOT NULL,
  max_daily NUMERIC(5,3) NOT NULL,
  bonus_percent NUMERIC(5,3) DEFAULT 0,
  period_days INTEGER NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  accrued NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
