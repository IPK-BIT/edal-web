<script context="module" lang="ts">
	export type OntoOption = { label: string; iri: string; ontology_name: string; type: string };
</script>
<script lang="ts">
	import { onMount } from 'svelte';

	export let label: string = '';
	export let showLabel: boolean = true;
	export let api: string = 'https://api.terminology.tib.eu/api/';
    
	export let selectionChangedEvent: (selectedOptions: OntoOption[]) => void = (selectedOptions) => {
		console.log(selectedOptions);
	};
	export let parameter: string = 'collection=DataPLANT';
	export let className: string | undefined = undefined;
	export let value: string[] = [];

	onMount(() => {
		// widget injected at runtime by external script
		const win = window as any;
		if (win && win.ts4nfdiWidgets && typeof win.ts4nfdiWidgets.createAutocomplete === 'function') {
			win.ts4nfdiWidgets.createAutocomplete(
				{
					api: api,
					parameter: parameter,
					selectionChangedEvent: updateValue,
					preselected: [],
					placeholder: 'Type to search...',
					hasShortSelectedLabel: true,
					allowCustomTerms: true,
					singleSelection: true,
					ts4nfdiGateway: false,
					singleSuggestionRow: false,
					showApiSource: true,
					className: className,
					initialSearchQuery: 'undefined'
				},
				document.querySelector('#autocomplete_widget_container_24')
			);
		}
	});

	function updateValue(selectedOptions: OntoOption[]) {
		if (selectedOptions.length > 0) {
			value = [...value, selectedOptions[0].label];
			selectionChangedEvent(selectedOptions);
		}
	}
</script>

<section class="px-4">
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{label}</legend>
		{/if}
		{#if value.length > 0}
			<ul class="px-2 py-4">
				{#each value as subject, i}
					<li class="flex justify-between p-1 hover:bg-base-300">
						<p>{subject}</p>
						<button
							class="btn btn-circle btn-xs btn-error"
							onclick={() => (value = value.filter((s, index) => index !== i))}>X</button
						>
					</li>
				{/each}
			</ul>
		{/if}
		<div id="autocomplete_widget_container_24"></div>
	</fieldset>
</section>
