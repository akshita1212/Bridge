import { sql } from '@vercel/postgres';

export { sql };

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

export function requirePostgresUrl() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not configured. Create a free Neon Postgres database and add the connection string to Vercel.');
  }
}
