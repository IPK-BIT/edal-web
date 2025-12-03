<script lang="ts">
  import { onMount } from "svelte";
  import FileUploader from "./FileUploader.svelte";
  import S3Access from "./S3Access.svelte";
  import steps from "$lib/config/steps.json";

  export let value: File[] = [];
  export let componentConfig: any = {};

  // Default options if not provided via componentConfig
  let options = [
    { label: "Local file upload", value: "local" },
    { label: "S3 Access", value: "s3" }
  ];

  // Use options from componentConfig if available
  onMount(() => {
    if (componentConfig && componentConfig.options) {
      options = componentConfig.options;
    }
  });

  let selectedTab = options[0].value;

  // For S3 form data
  let s3Data = {
    endpoint: "",
    bucket: "",
    accessKey: "",
    secretKey: ""
  };

  // Expose S3 data if needed
  export { s3Data };
</script>

<div class="tabs mb-4">
  {#each options as opt}
    <a
      class="tab tab-bordered {selectedTab === opt.value ? 'tab-active' : ''}"
      on:click={() => (selectedTab = opt.value)}
      >{opt.label}</a
    >
  {/each}
</div>

{#if selectedTab === "local"}
  <FileUploader bind:value />
{/if}

{#if selectedTab === "s3"}
  <S3Access bind:s3Data />
{/if}