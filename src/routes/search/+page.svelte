<script lang="ts">
	import FacetedSearch from '$lib/components/search/FacetedSearch.svelte';
	import Filter from '$lib/components/search/Filter.svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import Table from '$lib/components/search/Table.svelte';
	import { onMount } from 'svelte';

	type SearchPayload = {
		hitType: string;
		existingQuery: string;
		filters: unknown[];
		bottomResultId: number | null;
		pageSize: number;
		pageIndex: number;
		pagination: unknown[];
		pageArraySize: number;
		displayedPage: number;
		queries: unknown[];
		whereToSearch: string;
	};

	let payload: SearchPayload = {
		hitType: 'dataset',
		existingQuery: '',
		filters: [],
		bottomResultId: null,
		pageSize: 15,
		pageIndex: 0,
		pagination: [],
		pageArraySize: 0,
		displayedPage: 1,
		queries: [],
		whereToSearch: 'Metadata'
	};

	let data: { queries: unknown[]; facets: unknown[]; results: unknown[] } = $state({
		queries: [],
		facets: [],
		results: []
	});
	let activeFilter: string[] = $state([]);
	let facets: unknown[] = $state([]);

	async function parseQuery(filter: {
		type: string;
		searchterm: string;
		occur: string;
		fuzzy: boolean;
	}) {
		const response = await fetch('https://doi.ipk-gatersleben.de/rest/extendedSearch/parsequery', {
			method: 'POST',
			body: JSON.stringify(filter)
		});
		return await response.text();
	}

	async function search() {
		const response = await fetch('https://doi.ipk-gatersleben.de/rest/extendedSearch/search', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
		if (response.ok) {
			data = await response.json();
			facets = data.facets;
		} else {
			console.error('Failed to fetch faceted search data:', response.statusText);
		}
	}

	async function updateFacets() {
		const response = await fetch('https://doi.ipk-gatersleben.de/rest/extendedSearch/drillDown', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
		if (response.ok) {
			facets = await response.json();
		} else {
			console.error('Failed to fetch faceted search data:', response.statusText);
		}
	}

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const qValues = params.getAll('q');

		if (qValues.length) {
			for (const q of qValues) {
				if (!q) continue;
				activeFilter.push(
					await parseQuery({
						type: 'Allfields',
						searchterm: q,
						occur: 'MUST',
						fuzzy: true
					})
				);
			}
		}
		// remove URL parameters after processing without reloading the page
		if (qValues.length) {
			// Remove query parameters without constructing a mutable URL instance
			window.history.replaceState({}, document.title, window.location.pathname);
		}
		updateFacets();
	});

	$effect(() => {
		payload.queries = activeFilter;
		if (activeFilter.length > 0) {
			search();
		} else {
			data = { queries: [], facets: [], results: [] };
			updateFacets();
		}
	});

	// removed $inspect to satisfy linter
</script>

<SearchBar
	update={async (message: { type: string; searchterm: string; occur: string; fuzzy: boolean }) =>
		activeFilter.push(await parseQuery(message))}
/>
<div class="grid grid-cols-1 gap-4 md:grid-cols-[20%_80%]">
	<aside class="my-4 max-h-[calc(100vh-4rem)] overflow-auto rounded-lg bg-base-100">
		<FacetedSearch
			bind:facets
			update={async (category: string, value: { label: string; value: string }) =>
				activeFilter.push(
					await parseQuery({
						type: category,
						searchterm: value.label,
						occur: 'MUST',
						fuzzy: true
					})
				)}
		/>
	</aside>

	<main class="m-4 overflow-auto rounded-lg bg-base-200">
		<Filter
			bind:data={activeFilter}
			update={(message: string) => (activeFilter = activeFilter.filter((f) => f !== message))}
		/>
		<Table bind:data />
	</main>
</div>
