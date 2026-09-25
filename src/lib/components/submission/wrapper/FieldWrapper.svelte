<script lang="ts">
	import { datasetObj } from '$lib/stores/dataset';
	import { isArcReadOnly } from '$lib/js/arcMode';

	let { component: Component, field, jsonPath = undefined } = $props();

	let value = $derived(jsonPath && datasetObj.keyed ? datasetObj.keyed(jsonPath) : undefined);
	// embargoDate is the one field ARC mode leaves editable (assumption A2) - the
	// crate can't reliably encode an embargo decision.
	let readOnly = $derived(jsonPath === 'metadata.embargoDate' ? false : $isArcReadOnly);
</script>

<Component
	bind:value={$value}
	showLabel={true}
	label={field.label}
	mapping={field.mapping}
	attr={field.explanation}
	componentConfig={field.componentConfig}
	{readOnly}
/>
