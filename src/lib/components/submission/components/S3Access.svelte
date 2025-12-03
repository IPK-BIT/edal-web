<script lang="ts">
  export let value = {
    endpoint: "",
    bucket: "",
    accessKey: "",
    secretKey: ""
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
      placeholder="https://s3.example.com"
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
      placeholder="my-bucket"
      on:input={(e) => handleInput(e, "bucket")}
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
      placeholder="AKIA..."
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
      placeholder="********"
      on:input={(e) => handleInput(e, "secretKey")}
      autocomplete="off"
    />
  </div>
</div>