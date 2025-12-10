<script lang="ts">
  import S3Access from "./S3Access.svelte";
  import FileUploader from "./FileUploader.svelte";
	import { onMount } from "svelte";
	import ComponentWrapper from "../wrapper/ComponentWrapper.svelte";

  let {
    value = $bindable(),
    componentConfig
  } = $props();

  onMount(()=>{
    if (!value) {
      value = componentConfig?.options?.[0]?.value;
    }
  })

  const components = {
    "s3": S3Access,
    "local": FileUploader
  }
</script>

<div role="tablist" class="tabs tabs-border">
  {#each componentConfig.options as option}
    <button
      role="tab"
      class="tab {value === option.value ? 'tab-active' : ''}"
      onclick={() => {
        value = option.value;
      }}
    >
      {option.label}
    </button>
  {/each}
</div>

<div class="p-4">
  {#if components[value as keyof typeof components]}
  {#key value}
  <ComponentWrapper
    component={components[value as keyof typeof components]}
    jsonPath={componentConfig.options.find((option: { value: any; }) => option.value === value).jsonPath}
  />
  {/key}
  {/if}
</div>