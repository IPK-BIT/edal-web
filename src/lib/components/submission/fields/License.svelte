<script lang="ts">
	import { onMount } from 'svelte';

	let {
		label = '',
		lvl = '',
		attr,
		value = $bindable(),
		showLabel = true,
		focus = false
	} = $props();

	if (!label) {
		label = attr;
	}

	let options: { value: string; label: string }[] = $state([
		{ label: 'Creative Commons Zero v1.0 Universal', value: 'CC0-1.0' },
		{ label: 'Creative Commons Attribution 4.0 International', value: 'CC-BY-4.0' },
		{ label: 'Creative Commons Attribution-ShareAlike 4.0 International', value: 'CC-BY-SA-4.0' },
		{
			label: 'Creative Commons Attribution-NoDerivatives 4.0 International',
			value: 'CC-BY-ND-4.0'
		},
		{
			label: 'Creative Commons Attribution-NonCommercial 4.0 International',
			value: 'CC-BY-NC-4.0'
		},
		{
			label: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International',
			value: 'CC-BY-NC-SA-4.0'
		},
		{
			label: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International',
			value: 'CC-BY-NC-ND-4.0'
		}
	]);

	// onMount(async () => {
	// 	const response = await fetch(
	// 		'https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/json/licenses.json'
	// 	);
	// 	const data = await response.json();
	// 	options = data.licenses.map((license: { licenseId: string; name: string }) => ({
	// 		value: license.licenseId,
	// 		label: license.name
	// 	}));
	// });
</script>

<section class="px-4">
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{label}</legend>
		{/if}
		<select bind:value class="select w-full" aria-label={label}>
			<option value="" disabled selected>Select a license</option>
			{#each options as option (option)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</fieldset>
</section>
