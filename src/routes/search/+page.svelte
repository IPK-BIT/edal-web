<script lang="ts">
	import FacetedSearch from "$lib/components/search/FacetedSearch.svelte";
	import Filter from "$lib/components/search/Filter.svelte";
	import SearchBar from "$lib/components/search/SearchBar.svelte";
	import Table from "$lib/components/search/Table.svelte";
	import { onMount } from "svelte";


    let payload: any = {
        "hitType":"dataset",
        "existingQuery":"",
        "filters":[],
        "bottomResultId":null,
        "pageSize":15,
        "pageIndex":0,
        "pagination":[],
        "pageArraySize":0,
        "displayedPage":1,
        "queries":[],
        "whereToSearch":"Metadata"
    };

    let data: {queries: any[], facets: any[], results: any[]} = $state({queries: [], facets: [], results: []});
    let activeFilter: string[] = $state([])
    let facets: any[] = $state([]);

    async function parseQuery(filter: {type: string, searchterm: string, occur: string, fuzzy: boolean}) {
        const response = await fetch('https://doi.ipk-gatersleben.de/rest/extendedSearch/parsequery', {
            method: 'POST',
            body: JSON.stringify(filter)
        });
        return await response.text();
    };

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
                activeFilter.push(await parseQuery({
                    type: 'Allfields',
                    searchterm: q,
                    occur: 'MUST',
                    fuzzy: true
                }));
            }
        }
        // remove URL parameters after processing without reloading the page
        if (qValues.length) {
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, document.title, url.toString());
        }
        updateFacets();
    })

    $effect(() => {
        payload.queries = activeFilter;
        if (activeFilter.length > 0) {
            search();
        } else {
            data = {queries: [], facets: [], results: []};
            updateFacets();
        }
    });

    $inspect(facets);
</script>

<SearchBar update={async (message: {type: string, searchterm: string, occur: string, fuzzy: boolean}) => activeFilter.push(await parseQuery(message))} />
<div class="grid grid-cols-1 md:grid-cols-[20%_80%] gap-4">
    <aside class="bg-base-100 my-4 rounded-lg overflow-auto max-h-[calc(100vh-4rem)]">
        <FacetedSearch bind:facets={facets} update={async (category: string, value: {label: string, value: string}) => activeFilter.push(await parseQuery({
            "type": category,
            "searchterm": value.label,
            "occur": "MUST",
            "fuzzy": true
        }))} />
    </aside>

    <main class="bg-base-200 m-4 rounded-lg overflow-auto">
        <Filter bind:data={activeFilter} update={(message: any) => activeFilter = activeFilter.filter(f => f !== message)} />
        <Table bind:data={data} />
    </main>
</div>
