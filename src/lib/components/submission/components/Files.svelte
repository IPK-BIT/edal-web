<script lang="ts">
  import { onMount } from "svelte";
  import FileUploader from "./FileUploader.svelte";
  import S3Access from "./S3Access.svelte";
  import steps from "$lib/config/steps.json";
  import { datasetObj } from "$lib/stores/dataset";

  export let value: File[] = [];
  export let componentConfig: any = {};

  // Default options if not provided via componentConfig
  let options = [
    { label: "Local file upload", value: "local" },
    { label: "Object Store", value: "s3" }
  ];

  // Use options from componentConfig if available
  onMount(() => {
    if (componentConfig && componentConfig.options) {
      options = componentConfig.options;
    }
    $datasetObj.file_transfer_mode = "manual_upload";
  });

  let selectedTab = options[0].value;

</script>

<div class="tabs tabs-lift my-4">
  {#each options as opt}
    <a
      class="tab tab-bordered {selectedTab === opt.value ? 'tab-active' : ''}"
      on:click={() => {
        selectedTab = opt.value;
        $datasetObj.file_transfer_mode = selectedTab === "s3" ? "s3" : "manual_upload";
      }}
      >{opt.label}</a
    >
  {/each}
</div>

{#if selectedTab === "local"}
  <FileUploader bind:value />
{/if}

{#if selectedTab === "s3"}
  <S3Access bind:value={$datasetObj.s3access} />
{/if}
