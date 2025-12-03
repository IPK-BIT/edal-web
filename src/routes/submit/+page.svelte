<script lang="ts">
	import Schemas from "$lib";
	import Console from "$lib/components/submission/Console.svelte";
	import Questionnaire from "$lib/components/submission/Questionnaire.svelte";
	import { datasetObj } from "$lib/stores/dataset";
	import generalConfig from "$lib/config/general.json";

    $datasetObj = Schemas.getObjectFromSchema('dataset');

</script>

<section class="w-2/3 mx-auto">
	{#if generalConfig.env === 'dev'}
    <Console/>
	{/if}
    <Questionnaire/>
</section>