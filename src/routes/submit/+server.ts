import { db } from '$lib/server/db';
import { submissions } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';
import { fetchRoCrateData, type RoCrateMetadata } from '$lib/server/rocrate';
import type { RoCrateFileNode } from '$lib/js/crateUtils';
import type { RequestHandler } from './$types';

async function sha256Hex(value: string) {
	const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function timingSafeEqual(a: string, b: string) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

async function hmacHex(secret: string, message: string) {
	const key = await globalThis.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await globalThis.crypto.subtle.sign(
		'HMAC',
		key,
		new TextEncoder().encode(message)
	);
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export const GET: RequestHandler = async ({ url }) => {
	const submission_id = url.searchParams.get('submission_id');
	const access_token = url.searchParams.get('access_token');

	if (!submission_id || !access_token) {
		return new Response(
			JSON.stringify({ error: 'Missing query parameter: submission_id and access_token' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
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

	const providedHash = await sha256Hex(access_token);
	if (!timingSafeEqual(providedHash, submission.access_token_hash)) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let metadata: RoCrateMetadata | null = null;
	let fileTree: RoCrateFileNode[] = [];
	if (submission.rocrate_link && submission.gitlab_token) {
		try {
			const data = await fetchRoCrateData(submission.rocrate_link, submission.gitlab_token);
			metadata = data.metadata;
			fileTree = data.fileTree;
		} catch (err) {
			console.error('Failed to fetch RO-Crate metadata:', err);
		}
	}

	// gitlab_token never leaves the server: the client only needs the parsed metadata.
	const { access_token_hash, gitlab_token, ...submissionWithoutSecrets } = submission;

	return new Response(JSON.stringify({ ...submissionWithoutSecrets, metadata, fileTree }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ request }) => {
	if (!env.WEBHOOK_SECRET) throw new Error('WEBHOOK_SECRET is not set');

	const rawBody = await request.text();
	const signature = request.headers.get('x-webhook-signature');

	if (!signature || !timingSafeEqual(signature, await hmacHex(env.WEBHOOK_SECRET, rawBody))) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const payload = JSON.parse(rawBody);
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

	const access_token = globalThis.crypto.randomUUID() + globalThis.crypto.randomUUID();
	const access_token_hash = await sha256Hex(access_token);

	const [submission] = await db
		.insert(submissions)
		.values({
			gitlab_token,
			rocrate_link,
			user_id,
			arc_id,
			access_token_hash
		})
		.returning({ id: submissions.id });

	return new Response(
		JSON.stringify({ status: 'Submission received', submission_id: submission.id, access_token }),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
