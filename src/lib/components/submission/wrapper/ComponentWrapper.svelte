<script lang="ts">
	import { datasetObj } from '$lib/stores/dataset';

	let { component: Component, jsonPath = undefined, componentConfig = {} } = $props();

	let value = $derived(
		jsonPath && datasetObj.keyed
			? jsonPath === '.'
				? datasetObj
				: datasetObj.keyed(jsonPath)
			: undefined
	);
</script>

<Component bind:value={$value} {jsonPath} {componentConfig} />
