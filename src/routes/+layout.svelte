<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="{favicon}" />
	<title>e!DAL - Electronic Data Archive Library</title>
</svelte:head>

<main class="min-h-screen bg-base-200 text-base-content">
	<Header/>

	<div class="w-full p-4">
		{@render children?.()}
	</div>
</main>



