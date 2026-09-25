// The facade the UI talks to (docs/arc-migration-plan.md section 2.1). Owns the
// idle -> loading -> ready -> starting -> started | error state machine so no
// component has to own loading/error logic itself.
//
// Not wired into any UI yet (Phase 1) - see the plan's OQ-1 and this repo's Phase 1
// scope: nothing here may be called at runtime until there's a deployed instance.

import { get, writable } from 'svelte/store';
import { toDatasetPatch, type ArcAdapterResult } from './arcAdapter';
import { ArcApiError, errorMessageForKind, isRetryableKind } from './errors';
import { getMetadata, startSubmission as apiStartSubmission } from './plantHubToEdal';

export type ArcSubmissionState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'ready'; data: ArcAdapterResult }
	| { status: 'starting'; data: ArcAdapterResult }
	| { status: 'started'; data: ArcAdapterResult }
	| { status: 'error'; message: string; retryable: boolean };

function createArcSubmission() {
	const state = writable<ArcSubmissionState>({ status: 'idle' });

	function toErrorState(err: unknown, retryable: boolean): ArcSubmissionState {
		if (err instanceof ArcApiError) {
			return {
				status: 'error',
				message: errorMessageForKind(err.kind),
				retryable: isRetryableKind(err.kind) && retryable
			};
		}
		return {
			status: 'error',
			message: 'An unexpected error occurred while contacting the submission service.',
			retryable
		};
	}

	// Fetches and adapts metadata for `submissionId`. Safe to call again after an
	// error (e.g. from a manual Retry button) - get_metadata is idempotent.
	async function load(submissionId: string): Promise<void> {
		state.set({ status: 'loading' });
		try {
			const response = await getMetadata(submissionId);
			state.set({ status: 'ready', data: toDatasetPatch(response) });
		} catch (err) {
			state.set(toErrorState(err, true));
		}
	}

	// Fires the Finish trigger. Only valid from 'ready' - deliberately not retried on
	// failure (plan section 2.2/2.3): get_arcfiles is not known to be idempotent, so a
	// retry button here could double-submit.
	async function start(submissionId: string): Promise<void> {
		const current = get(state);
		if (current.status !== 'ready') return;
		state.set({ status: 'starting', data: current.data });
		try {
			await apiStartSubmission(submissionId);
			state.set({ status: 'started', data: current.data });
		} catch (err) {
			state.set(toErrorState(err, false));
		}
	}

	function reset(): void {
		state.set({ status: 'idle' });
	}

	return { subscribe: state.subscribe, load, start, reset };
}

export const arcSubmission = createArcSubmission();
