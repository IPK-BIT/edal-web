<script lang="ts">
	import { datasetObj } from '$lib/stores/dataset';

	let { component: Component, field, jsonPath = undefined } = $props();

	let value = $derived(jsonPath && datasetObj.keyed ? datasetObj.keyed(jsonPath) : undefined);
</script>

<Component
	bind:value={$value}
	showLabel={true}
	label={field.label}
	mapping={field.mapping}
	attr={field.explanation}
	componentConfig={field.componentConfig}
/>
