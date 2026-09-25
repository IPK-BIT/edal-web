// Error taxonomy for the plantHubToEdal client - see docs/arc-migration-plan.md
// section 2.3 for the condition/behavior table this mirrors.

export type ArcErrorKind =
	| 'not_found' // 404
	| 'bad_request' // 400 - should be unreachable, a contract bug if seen
	| 'server_error' // 5xx
	| 'network_error' // fetch rejected (offline, CORS, DNS, ...)
	| 'timeout' // AbortSignal.timeout fired
	| 'unknown';

export class ArcApiError extends Error {
	readonly kind: ArcErrorKind;
	readonly status?: number;

	constructor(kind: ArcErrorKind, message: string, status?: number) {
		super(message);
		this.name = 'ArcApiError';
		this.kind = kind;
		this.status = status;
	}
}

export function isRetryableKind(kind: ArcErrorKind): boolean {
	return kind === 'server_error' || kind === 'network_error' || kind === 'timeout';
}

// User-facing messages per the plan's error table. get_metadata's 400 case "should
// be unreachable" since we always send dlaRead=true - if seen, it's a contract bug.
export function errorMessageForKind(kind: ArcErrorKind): string {
	switch (kind) {
		case 'not_found':
			return 'This submission link is no longer valid — the submission service may have restarted. Please re-run the CQC pipeline in PLANTdataHUB.';
		case 'bad_request':
			return 'The submission service rejected this request unexpectedly. Please contact support with the submission id.';
		case 'server_error':
		case 'network_error':
		case 'timeout':
			return 'The submission service is temporarily unavailable. Please try again.';
		default:
			return 'An unexpected error occurred while contacting the submission service.';
	}
}
