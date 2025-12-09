<script lang="ts">
    let { 
        value: pdfOpened = $bindable(),
    } = $props();

    // let pdfOpened = $state(false);

    function openDdla() {
        const ddlaUrl = 'https://edal-pgp.ipk-gatersleben.de/document/PGP-contract.pdf'; // Adjust the path as necessary
        window.open(ddlaUrl, '_blank');
        pdfOpened = true;
    }


</script>

<div class="px-4 py-2">
    <div class="flex items-center gap-2 mb-2">
        <button type="button" onclick={openDdla} class="btn btn-sm">
            Open DDLA (required)
        </button>
        {#if !pdfOpened}
            <span class="text-sm text-gray-500">You must open the DDLA before agreeing.</span>
        {:else}
            <span class="text-sm text-green-600">DDLA opened — you can now proceed.</span>
        {/if}
    </div>
</div>