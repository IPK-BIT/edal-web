<script lang="ts">
	import Schemas from "$lib";
	import Console from "$lib/components/submission/Console.svelte";
	import Questionnaire from "$lib/components/submission/Questionnaire.svelte";
	import { datasetObj } from "$lib/stores/dataset";
	import generalConfig from "$lib/config/general.json";
	import { onMount } from "svelte";
	import ProgressBar from "$lib/components/submission/ProgressBar.svelte";

	onMount(async () => {
    	$datasetObj = Schemas.getObjectFromSchema('dataset');
	});

</script>

<section class="w-2/3 mx-auto">
	{#if generalConfig.env === 'dev'}
    <Console/>
	{/if}
	<ProgressBar/>
    <Questionnaire/>
</section>