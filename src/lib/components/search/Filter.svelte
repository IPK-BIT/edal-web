<script lang="ts">
	let {
		data = $bindable(),
		update = (evt: any) => {
			console.log(evt);
		}
	} = $props();
</script>

<div class="mt-1 mb-4 rounded-lg border border-base-300 bg-base-100 p-2">
	{#if data?.length === 0}
		<div class="text-center text-gray-500">No active filters.</div>
	{:else}
		<div class="flex flex-wrap items-center gap-2">
			{#each data as filter}
				<span class="flex items-center rounded border border-secondary p-1">
					{filter}
					<button
						type="button"
						aria-label="Remove filter Martin"
						title="Remove"
						class="btn ml-1 btn-circle btn-ghost btn-xs"
						onclick={() => update(filter)}
					>
						✕
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>
