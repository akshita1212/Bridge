import { json, requirePostgresUrl, sql } from './_db';

export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    requirePostgresUrl();
    const result = await sql`select now() as checked_at`;
    return json({ ok: true, database: 'connected', checkedAt: result.rows[0].checked_at });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : 'Unknown health check error' }, { status: 500 });
  }
}
