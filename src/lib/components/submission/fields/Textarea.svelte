<script lang="ts">
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
</script>

<section class="px-4">
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{label}</legend>
		{/if}
		<textarea
			class="resize-vertical input h-38 w-full p-2 text-justify"
			bind:value
			wrap="hard"
			style="white-space: pre-wrap; overflow-wrap: break-word;"
		></textarea>
	</fieldset>
</section>
