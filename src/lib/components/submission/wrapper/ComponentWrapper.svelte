<script lang="ts">
	import { datasetObj } from '$lib/stores/dataset';
	import { isArcReadOnly } from '$lib/js/arcMode';

	let { component: Component, jsonPath = undefined, componentConfig = {} } = $props();

	let value = $derived(
		jsonPath && datasetObj.keyed
			? jsonPath === '.'
				? datasetObj
				: datasetObj.keyed(jsonPath)
			: undefined
	);
	let readOnly = $derived($isArcReadOnly);
</script>

<Component bind:value={$value} {jsonPath} {componentConfig} {readOnly} />
