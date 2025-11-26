<script lang="ts">
    import { datasetStr } from "$lib/stores/dataset";
</script>

<details class="w-full mb-4">
    <summary class="cursor-pointer font-semibold">Debug Dataset JSON</summary>
    <div class="border border-neutral-300 p-2 rounded-lg mt-2">
        <textarea class="w-full min-h-[30vh] h-full focus-visible:outline-none" bind:value={$datasetStr}></textarea>
    </div>
</details>