import { derived } from 'svelte/store';
import { datasetObj } from '$lib/stores/dataset';
import generalConfig from '$lib/config/general.json';

// ARC mode turns the wizard into a read-only viewer (docs/arc-migration-plan.md
// section 3, item 8), but only once the plantHubToEdal path is actually live. Under
// arcSource: 'legacy' this must never trip, even though file_transfer_mode can
// already be 'rocrate' there today (via Files.svelte's onMount hack for a submission
// loaded through the old GET /submit) - the legacy ARC flow has to keep behaving
// exactly as it does now.
export const isArcReadOnly = derived(
	datasetObj,
	($dataset) =>
		generalConfig.arcSource === 'plantHubToEdal' && $dataset.file_transfer_mode === 'rocrate'
);
