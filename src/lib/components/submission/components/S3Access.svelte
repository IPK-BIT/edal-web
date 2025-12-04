<script lang="ts">
  export let value = {
    endpoint: "",
    bucket: "",
    accessKey: "",
    secretKey: "",
    region: ""
  };

  function handleInput(e: Event, field: string) {
    // @ts-ignore
    value[field] = e.target.value;
  }
</script>

<div class="form-control space-y-4">
  <div>
    <label class="label">
      <span class="label-text">S3 Endpoint URL</span>
    </label>
    <input
      class="input input-bordered w-full"
      type="text"
      bind:value={value.endpoint}
      on:input={(e) => handleInput(e, "endpoint")}
      autocomplete="off"
    />
  </div>
  <div>
    <label class="label">
      <span class="label-text">Bucket Name</span>
    </label>
    <input
      class="input input-bordered w-full"
      type="text"
      bind:value={value.bucket}
      on:input={(e) => handleInput(e, "bucket")}
      autocomplete="off"
    />
  </div>
  <div>
    <label class="label">
      <span class="label-text">Region</span>
    </label>
    <input
      class="input input-bordered w-full"
      type="text"
      bind:value={value.region}
      on:input={(e) => handleInput(e, "region")}
      autocomplete="off"
    />
  </div>
  <div>
    <label class="label">
      <span class="label-text">Access Key</span>
    </label>
    <input
      class="input input-bordered w-full"
      type="text"
      bind:value={value.accessKey}
      on:input={(e) => handleInput(e, "accessKey")}
      autocomplete="off"
    />
  </div>
  <div>
    <label class="label">
      <span class="label-text">Secret Key</span>
    </label>
    <input
      class="input input-bordered w-full"
      type="password"
      bind:value={value.secretKey}
      on:input={(e) => handleInput(e, "secretKey")}
      autocomplete="off"
    />
  </div>
</div>
