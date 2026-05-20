<script lang="ts">
	let {
		update = (evt: any) => {
			console.log(evt);
		}
	} = $props();

	let value = $state('');
</script>

<div class="flex gap-2">
	<input
		type="text"
		placeholder="Search..."
		class="input-bordered input w-full"
		bind:value
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				update({ type: 'Allfields', searchterm: value, occur: 'MUST', fuzzy: true });
				value = '';
			}
		}}
	/>
	<button
		class="btn btn-primary"
		onclick={() => {
			update({ type: 'Allfields', searchterm: value, occur: 'MUST', fuzzy: true });
			value = '';
		}}
	>
		Search
	</button>
</div>
