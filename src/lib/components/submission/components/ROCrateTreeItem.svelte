<script lang="ts">
	import type { RoCrateFileNode } from '$lib/js/crateUtils';
	import ROCrateTreeItem from './ROCrateTreeItem.svelte';

	let { node }: { node: RoCrateFileNode } = $props();

	let expanded = $state(false);
</script>

<li>
	{#if node.kind === 'directory'}
		<button
			type="button"
			class="btn btn-block justify-start gap-2 btn-ghost btn-sm"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
		>
			<svg
				class="h-3 w-3 shrink-0 transition-transform {expanded ? 'rotate-90' : ''}"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
			</svg>
			<svg
				class="h-4 w-4 shrink-0 text-warning"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					d="M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414A1 1 0 0012.414 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
				/>
			</svg>
			<span class="truncate">{node.name}</span>
		</button>
		{#if expanded}
			<ul class="border-l border-base-300 pl-4">
				{#each node.children as child (child.path)}
					<ROCrateTreeItem node={child} />
				{/each}
			</ul>
		{/if}
	{:else}
		<div class="flex items-center gap-2 px-3 py-1.5 text-sm">
			<svg
				class="h-4 w-4 shrink-0 text-neutral-500"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5H7z"
				/>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 3v5h5" />
			</svg>
			<span class="truncate">{node.name}</span>
		</div>
	{/if}
</li>
