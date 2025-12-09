<script lang="ts">
	import Schemas from "$lib/js";
	import Console from "$lib/components/submission/Console.svelte";
	import Questionnaire from "$lib/components/submission/Questionnaire.svelte";
	import { datasetObj } from "$lib/stores/dataset";
	import generalConfig from "$lib/config/general.json";
	import { onMount } from "svelte";
	import ProgressBar from "$lib/components/submission/ProgressBar.svelte";

	let submissionId: string = '';

	onMount(async () => {
    	$datasetObj = Schemas.getObjectFromSchema('dataset');
		const params = new URLSearchParams(window.location.search);
		submissionId = params.get('submission_id') || '';
		if (submissionId) {
			// load exisiting submission from GET /submit?submission_id=...
			try {
				const res = await fetch(`/submit?submission_id=${submissionId}`);
				if (res.ok) {
					let metadata = {
						"title": "Facultative CAM in Talinum",
						"description": "This is a descriptive description describing my dataset",
						"authors": [],
						"language": "",
						"subjects": [
							"RNASeq",
							"Transcriptomics",
							"Drought Stress",
							"Talinum triangulare"
						],
						"license": "MIT",
					}
					$datasetObj.metadata = metadata;

					console.log('Loaded submission:', $datasetObj);
				} else {
					console.error('Failed to load submission:', res.statusText);
				}
			} catch (error) {
				console.error('Error loading submission:', error);
			}
		}
	});

</script>

<section class="w-2/3 mx-auto">
	{#if generalConfig.env === 'dev'}
    <Console/>
	{/if}
	<ProgressBar/>
    <Questionnaire/>
</section>