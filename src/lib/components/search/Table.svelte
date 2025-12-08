<script lang="ts">
    let {
        data = $bindable()
    } = $props();
</script>

<div class="overflow-x-auto bg-base-100 p-4 rounded-lg shadow-sm">
    {#if data?.results?.length}
        <div class="flex justify-end">
            <p class="text-sm text-gray-500 mb-2">
                Showing {((data.displayedPage ?? 1) - 1) * data.results.length + 1} to {Math.min((data.displayedPage ?? 1) * data.results.length, data.hitSize ?? ((data.displayedPage ?? 1) * data.results.length))} of {data.hitSize ?? data.results.length} results
            </p>
        </div>
        <table class="table w-full table-zebra">
            <thead>
                <tr class="">
                    <th class="w-28">ID</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {#each data.results as result}
                    <tr class="hover:cursor-pointer hover:bg-secondary hover:text-secondary-content" onclick={() => window.open(`https://dx.doi.org/${result.doi}`, '_blank')}>
                        <td>
                            <span class="badge badge-sm badge-outline">{result.doi}</span>
                        </td>
                        <td class="font-medium">{result.title}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <div class="flex items-center justify-center mt-4">
            <div class="join">
                <button class="btn btn-outline join-item">Prev</button>
                {#each data.pageArray as page}
                    <button
                        class="btn join-item btn-outline transition"
                        class:btn-primary={page.active}
                        class:btn-ghost={!page.active}
                        aria-current={page.active ? 'page' : undefined}
                    >
                        {page.page}
                    </button>
                {/each}
                <button class="btn btn-outline join-item">Next</button>
            </div>
        </div>

    {:else}
        <div class="flex items-center justify-center p-6 text-sm text-gray-500">
            No results found.
        </div>
    {/if}
</div>