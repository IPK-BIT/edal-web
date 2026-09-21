import { db } from '$lib/server/db';
import { submissions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const submission_id = url.searchParams.get('submission_id');

	if (!submission_id) {
		return new Response(JSON.stringify({ error: 'Missing query parameter: submission_id' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.id, submission_id))
		.limit(1);

	if (!submission) {
		return new Response(JSON.stringify({ error: 'Submission not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response(JSON.stringify(submission), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json();
	const { gitlab_token, rocrate_link, user_id, arc_id } = payload ?? {};

	if (!gitlab_token || !rocrate_link || !user_id || !arc_id) {
		return new Response(JSON.stringify({ error: 'Missing fields' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (
		typeof gitlab_token !== 'string' ||
		typeof rocrate_link !== 'string' ||
		typeof user_id !== 'number' ||
		typeof arc_id !== 'number'
	) {
		return new Response(JSON.stringify({ error: 'Invalid field types' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const [submission] = await db
		.insert(submissions)
		.values({
			gitlab_token,
			rocrate_link,
			user_id,
			arc_id
		})
		.returning({ id: submissions.id });

	return new Response(
		JSON.stringify({ status: 'Submission received', submission_id: submission.id }),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
