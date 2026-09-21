<script lang="ts">
	import { countFiles, type RoCrateFileNode } from '$lib/js/crateUtils';
	import ROCrateTreeItem from './ROCrateTreeItem.svelte';

	let { nodes }: { nodes: RoCrateFileNode[] } = $props();

	let fileCount = $derived(countFiles(nodes));
</script>

<div class="card mt-4 border border-base-300 bg-base-100 p-4">
	<h3 class="card-title text-base">Files ({fileCount})</h3>
	{#if nodes.length > 0}
		<ul class="mt-1 text-sm">
			{#each nodes as node (node.path)}
				<ROCrateTreeItem {node} />
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-neutral">No files found in this RO-Crate.</p>
	{/if}
</div>
