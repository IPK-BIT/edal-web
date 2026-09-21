<script lang="ts">
	import Schemas from '$lib/js';
	import Console from '$lib/components/submission/Console.svelte';
	import Questionnaire from '$lib/components/submission/Questionnaire.svelte';
	import { datasetObj, linkedSubmission, type Dataset } from '$lib/stores/dataset';
	import generalConfig from '$lib/config/general.json';
	import { onMount } from 'svelte';
	import ProgressBar from '$lib/components/submission/ProgressBar.svelte';

	let submissionId: string = '';

	onMount(async () => {
		$datasetObj = Schemas.getObjectFromSchema('dataset') as Dataset;
		linkedSubmission.set(null);
		const params = new URLSearchParams(window.location.search);
		submissionId = params.get('submission_id') || '';
		const accessToken = params.get('access_token') || '';
		if (submissionId && accessToken) {
			// load exisiting submission from GET /submit?submission_id=...&access_token=...
			try {
				const res = await fetch(
					`/submit?submission_id=${encodeURIComponent(submissionId)}&access_token=${encodeURIComponent(accessToken)}`
				);
				if (res.ok) {
					const submission = await res.json();
					if (submission.metadata) {
						$datasetObj.metadata = { ...$datasetObj.metadata, ...submission.metadata };
					}
					// Only pick known, non-secret fields onto the client store, so a
					// future column added to `submissions` isn't exposed by default.
					linkedSubmission.set({
						id: submission.id,
						rocrate_link: submission.rocrate_link ?? null,
						user_id: submission.user_id ?? null,
						arc_id: submission.arc_id ?? null,
						submitted_at: submission.submitted_at ?? null,
						fileTree: submission.fileTree ?? []
					});
				} else {
					console.error('Failed to load submission:', res.statusText);
				}
			} catch (error) {
				console.error('Error loading submission:', error);
			}
		}
	});
</script>

<section class="mx-auto w-2/3">
	{#if generalConfig.env === 'dev'}
		<Console />
	{/if}
	<ProgressBar />
	<Questionnaire />
</section>
