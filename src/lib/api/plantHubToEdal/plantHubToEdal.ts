// Typed browser-side client for the plantHubToEdal microservice. Mirrors the
// existing info/exists call pattern (browser-side fetch, base URL from
// general.json, Bearer from localStorage) so CORS and auth behave identically -
// see docs/arc-migration-plan.md section 2.1.
//
// Not called from any UI yet (Phase 1) - there is no deployed instance.

import { backendUrl } from '$lib/config/backends';
import { ArcApiError, isRetryableKind, type ArcErrorKind } from './errors';
import type { components } from './types.generated';

export type MetadataResponse = components['schemas']['MetadataResponse'];

const METADATA_TIMEOUT_MS = 30_000;
const START_TIMEOUT_MS = 120_000;

const METADATA_RETRY_COUNT = 3;
const RETRY_BASE_DELAY_MS = 500;

function authHeaders(): HeadersInit {
	const token = localStorage.getItem('access_token');
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doFetch(url: string, timeoutMs: number, headers: HeadersInit): Promise<Response> {
	try {
		return await fetch(url, {
			method: 'GET',
			headers,
			signal: AbortSignal.timeout(timeoutMs)
		});
	} catch (err) {
		if (err instanceof DOMException && err.name === 'TimeoutError') {
			throw new ArcApiError('timeout', `Request to ${url} timed out after ${timeoutMs}ms`);
		}
		throw new ArcApiError('network_error', `Network error while requesting ${url}`);
	}
}

function statusToKind(status: number): ArcErrorKind {
	if (status === 404) return 'not_found';
	if (status === 400) return 'bad_request';
	if (status >= 500) return 'server_error';
	return 'unknown';
}

async function getMetadataOnce(submissionId: string): Promise<MetadataResponse> {
	const url = `${backendUrl('plantHubToEdal')}/${encodeURIComponent(submissionId)}/get_metadata?dlaRead=true`;
	const response = await doFetch(url, METADATA_TIMEOUT_MS, {
		'Content-Type': 'application/json',
		...authHeaders()
	});
	if (!response.ok) {
		const kind = statusToKind(response.status);
		throw new ArcApiError(
			kind,
			`get_metadata failed with status ${response.status}`,
			response.status
		);
	}
	return (await response.json()) as MetadataResponse;
}

// get_metadata is synchronous, idempotent and on the critical path, so 5xx/network/
// timeout failures are retried 3x with exponential backoff and jitter before
// surfacing a terminal error (plan section 2.3). 400/404 are not retried - they're
// either unreachable (400, a contract bug) or genuinely terminal (404).
export async function getMetadata(submissionId: string): Promise<MetadataResponse> {
	let lastError: unknown;
	for (let attempt = 0; attempt <= METADATA_RETRY_COUNT; attempt++) {
		try {
			return await getMetadataOnce(submissionId);
		} catch (err) {
			lastError = err;
			const kind = err instanceof ArcApiError ? err.kind : 'unknown';
			if (attempt === METADATA_RETRY_COUNT || !isRetryableKind(kind)) throw err;
			const backoff = RETRY_BASE_DELAY_MS * 2 ** attempt;
			const jitter = Math.random() * RETRY_BASE_DELAY_MS;
			await sleep(backoff + jitter);
		}
	}
	throw lastError;
}

// A1: get_arcfiles?finishWebUI=true is used purely as a trigger. Assert the status,
// then cancel the response body stream immediately - a multi-GB base64 array must
// never be parsed or land in browser memory. Never retried automatically (plan
// section 2.3, OQ-1/question 2): it's not known to be idempotent.
export async function startSubmission(submissionId: string): Promise<void> {
	const url = `${backendUrl('plantHubToEdal')}/${encodeURIComponent(submissionId)}/get_arcfiles?finishWebUI=true`;
	const response = await doFetch(url, START_TIMEOUT_MS, authHeaders());
	await response.body?.cancel();
	if (!response.ok) {
		const kind = statusToKind(response.status);
		throw new ArcApiError(
			kind,
			`get_arcfiles failed with status ${response.status}`,
			response.status
		);
	}
}
