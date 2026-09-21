import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { scorpion } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
	const [scorpionConfig] = await db.select({ token: scorpion.token }).from(scorpion).limit(1);
	const token = scorpionConfig?.token;

	if (!token) {
		return new Response(JSON.stringify({ error: 'Scorpion token not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - 1);
	startDate.setDate(1);
	startDate.setHours(0, 0, 0, 0);

	const params = {
		service: 'PGP',
		start: startDate.toISOString(),
		indicators: 'Downloads,Hits,Unique Users,Visits'
	};

	const response = await fetch(
		'https://scorpion.bi.denbi.de/nfdi/api/v1/measurements?' + new URLSearchParams(params),
		{
			method: 'GET',
			headers: {
				'X-API-Key': token
			}
		}
	);

	return new Response(JSON.stringify(await response.json()), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
