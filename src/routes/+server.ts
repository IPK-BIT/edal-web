import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { start } from 'repl';

const db = new Database('edal-submissions.db');

export const GET: RequestHandler = async ({ url }) => {
    const token = (db.prepare('SELECT token from scorpion LIMIT 1').get() as { token: string })['token'];

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    let params = {
        service: 'PGP',
        start: startDate.toISOString(),
        indicators: 'Downloads,Hits,Unique Users,Visits'
    };

    const response = await fetch('https://scorpion.bi.denbi.de/nfdi/api/v1/measurements?' + new URLSearchParams(params), {
        method: 'GET',
        headers: {
            'X-API-Key': token
        }
    })

    return new Response(JSON.stringify(await response.json()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
