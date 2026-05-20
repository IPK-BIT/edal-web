<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={favicon} />
	<title>e!DAL - Electronic Data Archive Library</title>
</svelte:head>

<main class="min-h-screen bg-base-200 text-base-content">
	<Header />

	<div class="mb-4 w-full p-4">
		{@render children?.()}
	</div>

	<footer class="fixed right-0 bottom-0 left-0 z-50 py-3">
		<div class="mx-auto max-w-5xl px-6">
			<div
				class="flex items-center justify-between rounded-lg border-t border-base-300/50 bg-base-100/70 px-4 py-2 shadow-md backdrop-blur-sm"
			>
				<div>
					<small class="text-sm text-neutral/85">
						e!DAL — publish large plant genomics & phenomics datasets with DOIs
					</small>
				</div>
				<div class="flex items-center gap-3">
					<a
						class="btn text-neutral/90 btn-ghost btn-sm"
						href="https://github.com/IPK-BIT/edal-web"
						target="_blank"
					>
						Source
					</a>
					<a
						class="btn text-neutral/90 btn-ghost btn-sm"
						href="https://github.com/IPK-BIT/edal-web/issues"
						target="_blank"
					>
						Help
					</a>
				</div>
			</div>
		</div>
	</footer>
</main>
