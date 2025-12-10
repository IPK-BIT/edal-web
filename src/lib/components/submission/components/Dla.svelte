<script lang="ts">
    let { 
        value: pdfOpened = $bindable(),
    } = $props();

    function openDla() {
        const dlaUrl = 'https://edal-pgp.ipk-gatersleben.de/document/PGP-contract.pdf'; // Adjust the path as necessary
        window.open(dlaUrl, '_blank');
        pdfOpened = true;
    }


</script>

<div class="px-4 py-2">
    <div class="flex items-center gap-2 mb-2">
        <button type="button" onclick={openDla} class="btn btn-sm">
            Open DLA (required)
        </button>
        {#if !pdfOpened}
            <span class="text-sm text-gray-500">You must open the DLA before agreeing.</span>
        {:else}
            <span class="text-sm text-green-600">DLA opened — you can now proceed.</span>
        {/if}
    </div>
</div>