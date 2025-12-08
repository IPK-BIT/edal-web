<script lang="ts">
	import { onMount } from "svelte";

    let {
        facets = $bindable(),
        update = (category: string, value: {label: string, value: string}) => { console.log('updating facet') }
    } = $props();

    let exampleQuery = {
        "hitType":"dataset",
        "filters":[]
    };

    let data: {category: string, sortedByHits: {label: string, value: string}[]}[] = $state([]);

    onMount(async () => {
    })
</script>

<div>
    <!-- <div>
        <h3>Search In</h3>
        <div>
            <label>
                <input type="radio" name="search-in" />
                Metadata
            </label>
            <label>
                <input type="radio" name="search-in"/>
                Content
            </label>
        </div>
    </div> -->
    {#each facets as facet}
        <div class="p-4 border-b border-gray-200">
            <details open>
                    <summary class="font-semibold mb-2">{facet.category}</summary>
                <ul>
                {#each facet.sortedByHits as value, i}
                    {#if i < 5}
                        <li class="flex items-center mb-1 ml-4">
                            <button 
                                class="text-sm text-gray-700 hover:underline hover:cursor-pointer"
                                onclick={()=>update(facet.category, value)}
                            >
                                {value.label}
                            </button>
                            <span class="text-xs text-gray-500 ml-2">({value.value})</span>
                        </li>
                    {:else if i === 5}
                        <li class="ml-4">
                            <button class="text-sm text-blue-500 hover:underline">
                                More ({facet.sortedByHits.length - 5})
                            </button>
                        </li>
                    {/if}
                {/each}
                </ul>
            </details>
        </div>
    {/each}
</div>