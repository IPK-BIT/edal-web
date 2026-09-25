<script lang="ts">
	import { datasetObj } from '$lib/stores/dataset';
	import { isArcReadOnly } from '$lib/js/arcMode';

	let { component: Component, field, jsonPath = undefined } = $props();

	let value = $derived(jsonPath && datasetObj.keyed ? datasetObj.keyed(jsonPath) : undefined);
	// A field can opt out of ARC read-only mode via steps.json (arcReadOnlyExempt) -
	// embargoDate is the one such field today (assumption A2), since the crate can't
	// reliably encode an embargo decision.
	let readOnly = $derived(field.arcReadOnlyExempt ? false : $isArcReadOnly);
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
