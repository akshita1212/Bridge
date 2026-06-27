import { json, requirePostgresUrl, sql } from './_db';

export const config = { runtime: 'edge' };

type TaskPayload = {
  bridgeId?: string;
  title?: string;
  assigneeLabel?: string;
  status?: 'to_do' | 'in_progress' | 'waiting' | 'blocked' | 'needs_review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  linkedContext?: Record<string, unknown>;
  visibility?: 'private' | 'shared_person' | 'shared_group' | 'main_context';
};

export default async function handler(request: Request) {
  try {
    requirePostgresUrl();
    const url = new URL(request.url);
    const bridgeId = url.searchParams.get('bridgeId');

    if (request.method === 'GET') {
      if (!bridgeId) return json({ error: 'bridgeId is required' }, { status: 400 });
      const [tasks, questions, changes, people] = await Promise.all([
        sql`select * from tasks where bridge_id = ${bridgeId} order by created_at desc`,
        sql`select * from questions where bridge_id = ${bridgeId} order by created_at desc`,
        sql`select * from sources where bridge_id = ${bridgeId} and status in ('changed', 'needs_analysis') order by last_updated_at desc nulls last`,
        sql`
          select assignee_label as label, count(*)::int as task_count,
          count(*) filter (where status = 'blocked')::int as blocked_count,
          count(*) filter (where status = 'needs_review')::int as review_count
          from tasks where bridge_id = ${bridgeId} and assignee_label is not null
          group by assignee_label order by task_count desc
        `,
      ]);
      return json({ tasks: tasks.rows, questions: questions.rows, changes: changes.rows, people: people.rows });
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as TaskPayload;
      if (!body.bridgeId || !body.title?.trim()) return json({ error: 'bridgeId and title are required' }, { status: 400 });
      const count = await sql`select count(*)::int + 1 as next_number from tasks where bridge_id = ${body.bridgeId}`;
      const taskKey = `BRG-${String(count.rows[0].next_number).padStart(2, '0')}`;
      const result = await sql`
        insert into tasks (bridge_id, task_key, title, assignee_label, status, priority, due_date, linked_context, visibility)
        values (${body.bridgeId}, ${taskKey}, ${body.title.trim()}, ${body.assigneeLabel || null}, ${body.status || 'to_do'}, ${body.priority || 'medium'}, ${body.dueDate || null}, ${JSON.stringify(body.linkedContext || {})}, ${body.visibility || 'shared_person'})
        returning *
      `;
      await sql`insert into activity_events (bridge_id, event_type, summary, target_type, target_id) values (${body.bridgeId}, 'task_created', ${`Created ${taskKey}: ${body.title.trim()}`}, 'task', ${result.rows[0].id})`;
      return json({ task: result.rows[0] }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown context work API error' }, { status: 500 });
  }
}
