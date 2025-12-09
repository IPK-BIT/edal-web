<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import { checkTokenValidity, renewToken } from '$lib/js/oidc';

	let { children } = $props();

	onMount(()=>{
		let timer: ReturnType<typeof setTimeout>;

		const checkAndSchedule = () => {
			if(!checkTokenValidity(localStorage.getItem('access_token')||'')) {
				renewToken(localStorage.getItem('refresh_token')||'');
			} else {
				console.log('Access token is still valid.');
			}
			// schedule next check
			timer = setTimeout(checkAndSchedule, 5000);
		};

		// start loop
		timer = setTimeout(checkAndSchedule, 5000);

		// cleanup when component is destroyed
		return () => clearTimeout(timer);
	})
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
	
	<footer class="fixed bottom-0 left-0 right-0 z-50 py-3">
		<div class="mx-auto max-w-5xl px-6">
			<div class="backdrop-blur-sm bg-base-100/70 border-t border-base-300/50 flex items-center justify-between px-4 py-2 rounded-lg shadow-md">
				<div>
					<small class="text-sm text-neutral/85">
						e!DAL — publish large plant genomics & phenomics datasets with DOIs
					</small>
				</div>
				<div class="flex items-center gap-3">
					<a class="btn btn-ghost btn-sm text-neutral/90" href="https://github.com/IPK-BIT/edal-web" target="_blank">
						Source
					</a>
					<a class="btn btn-ghost btn-sm text-neutral/90" href="https://github.com/IPK-BIT/edal-web/issues" target="_blank">
						Help
					</a>
				</div>
			</div>
		</div>
	</footer>
</main>



