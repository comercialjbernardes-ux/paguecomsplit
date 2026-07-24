import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL não configurado. Adicione no painel Netlify > Environment Variables."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

export const DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS pcs_users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'representante',
  whatsapp    VARCHAR(20),
  rep_code    VARCHAR(64)  UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
`;
