import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('edal-submissions.db');

export const GET: RequestHandler = async ({ url }) => {
    const submission_id = url.searchParams.get('submission_id');

    if (!submission_id) {
        return new Response(JSON.stringify({ error: 'Missing query parameter: submission_id' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const st = db.prepare('SELECT id, gitlab_token, rocrate_link, user_id, arc_id, submitted_at FROM submissions WHERE id = ?');
    const row = st.get(submission_id);

    if (!row) {
        return new Response(JSON.stringify({ error: 'Submission not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(row), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const POST: RequestHandler = async ({ request }) => {
    const payload = await request.json();
    const { gitlab_token, rocrate_link, user_id, arc_id } = payload ?? {};

    const submission_id = randomUUID();

    db.exec(`CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY NOT NULL,
        gitlab_token TEXT NOT NULL,
        rocrate_link TEXT NOT NULL,
        user_id TEXT NOT NULL,
        arc_id TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    if (!gitlab_token || !rocrate_link || !user_id || !arc_id) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (
        typeof gitlab_token !== 'string' ||
        typeof rocrate_link !== 'string' ||
        typeof user_id !== 'string' ||
        typeof arc_id !== 'string'
    ) {
        return new Response(JSON.stringify({ error: 'Invalid field types' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const stmnt = db.prepare('INSERT INTO submissions (id, gitlab_token, rocrate_link, user_id, arc_id) VALUES (?, ?, ?, ?, ?)');
    stmnt.run(submission_id, gitlab_token, rocrate_link, user_id, arc_id);

    console.log('Submission received', {
        user_id,
        arc_id,
        rocrate_link,
        gitlab_token: '[REDACTED]'
    });
    return new Response(JSON.stringify({ status: 'Submission received', submission_id: submission_id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}