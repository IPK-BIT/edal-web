<script lang="ts">
	import Schemas from "$lib/js";

  let {
    value = $bindable()
  } = $props();

  if (Object.keys(value).length === 0) {
    value = Schemas.getObjectFromSchema("s3-connection-details");
  }
</script>

<div>
  <fieldset class="fieldset">
    <legend class="fieldset-legend"><span class="label-text">Endpoint</span></legend>
    <input type="text" class="input input-bordered w-full" bind:value={value.endpoint} />
  </fieldset>
  <fieldset class="fieldset">
    <legend class="fieldset-legend"><span class="label-text">Region</span></legend>
    <input type="text" class="input input-bordered w-full" bind:value={value.region} />
  </fieldset>
  <fieldset class="fieldset">
    <legend class="fieldset-legend"><span class="label-text">Bucket</span></legend>
    <input type="text" class="input input-bordered w-full" bind:value={value.bucket} />
  </fieldset>
  <fieldset class="fieldset">
    <legend class="fieldset-legend"><span class="label-text">Access Key ID</span></legend>
    <input type="text" class="input input-bordered w-full" bind:value={value.accessKey} />
  </fieldset>
  <fieldset class="fieldset">
    <legend class="fieldset-legend"><span class="label-text">Secret Access Key</span></legend>
    <input type="password" class="input input-bordered w-full" bind:value={value.secretKey} />
  </fieldset>
</div>