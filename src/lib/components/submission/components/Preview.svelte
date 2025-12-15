<script lang="ts">
    import { datasetObj } from "$lib/stores/dataset";
    import orcidLogo from '$lib/assets/orcid.logo.icon.svg';
</script>

<div class="card bg-base-100 shadow-md rounded-lg p-4 m-4">
    <div class="card-body p-0">
        <h3 class="card-title text-lg">
            {$datasetObj.metadata.title || 'No Title Provided'}
            <span class="badge badge-primary ml-2">{new Date().getFullYear()}</span>
        </h3>

        <p class="text-sm text-neutral-700">
            {#each $datasetObj.metadata.authors as author,i}
            {author.firstName} {author.lastName} 
            <a href={author.orcid ? `https://orcid.org/${author.orcid}` : '#'} target="_blank" aria-label="ORDCID">
                <img src={orcidLogo} alt="ORCID Logo" class="inline h-4 w-4"/>
            </a>
            {#if i < $datasetObj.metadata.authors.length - 1},&nbsp;{/if}
            {/each}
        </p>

        <div class="text-xs text-neutral-500">
            e!DAL - Plant Genomics and Phenomics Research Data Repository (PGP), IPK Gatersleben;
            Seeland OT Gatersleben, Corrensstraße 3; 06466; Germany
        </div>
        <div class="mt-2">
            {#if $datasetObj.file_transfer_mode === 'local'}
                <span class="badge badge-secondary">Local File Upload</span>
                <span>number of files: {Object.keys($datasetObj.files).length}</span>
            {:else if $datasetObj.file_transfer_mode === 's3'}
                <span class="badge badge-accent">S3 Transfer</span>
                <span class="">{$datasetObj.s3access.validationMsg}</span>
            {/if}
        </div>
    </div>
</div>
 