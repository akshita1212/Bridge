import { json, requirePostgresUrl, sql } from './_db';

export const config = { runtime: 'edge' };

type BridgePayload = { title?: string; description?: string; workspaceId?: string; ownerId?: string };

export default async function handler(request: Request) {
  try {
    requirePostgresUrl();

    if (request.method === 'GET') {
      const result = await sql`
        select b.*, count(s.id)::int as source_count, count(t.id)::int as task_count
        from bridges b
        left join sources s on s.bridge_id = b.id
        left join tasks t on t.bridge_id = b.id
        group by b.id
        order by b.updated_at desc
        limit 50
      `;
      return json({ bridges: result.rows });
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as BridgePayload;
      if (!body.title?.trim()) return json({ error: 'title is required' }, { status: 400 });
      const result = await sql`
        insert into bridges (workspace_id, owner_id, title, description)
        values (${body.workspaceId || null}, ${body.ownerId || null}, ${body.title.trim()}, ${body.description || null})
        returning *
      `;
      return json({ bridge: result.rows[0] }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown bridges API error' }, { status: 500 });
  }
}
