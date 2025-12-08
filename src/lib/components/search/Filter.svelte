<script lang="ts">
    let {
        data = $bindable(),
        update = (evt: any) => { console.log(evt) }
    } = $props();
</script>

<div class="p-2 border border-base-300 mt-1 mb-4 bg-base-100 rounded-lg">
    {#if data?.length === 0}
    <div class="text-center text-gray-500">
        No active filters.
    </div>
    {:else}
    <div class="flex flex-wrap gap-2 items-center">
        {#each data as filter}
        <span class="border border-secondary rounded p-1 items-center flex">
            {filter}
            <button
                type="button"
                aria-label="Remove filter Martin"
                title="Remove"
                class="btn btn-xs btn-circle btn-ghost ml-1"
                onclick={() => update(filter)}
            >
                ✕
            </button>
        </span>
        {/each}
    </div>
    {/if}
</div>