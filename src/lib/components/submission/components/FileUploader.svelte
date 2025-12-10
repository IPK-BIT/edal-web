<script lang="ts">

  export let value: File[] = [];

  function readFiles(evt: Event) {
    //@ts-ignore
    value = evt.target ? evt.target.files : {};
  }

  function setAttributeWebkitdirectory(node: any) {
    node.setAttribute("webkitdirectory", "");
  }
</script>

<div class="gap-4 flex flex-col">
  <form class="form-control">
    <label class="input-group">
      <span class="btn btn-outline btn-secondary">Select Folder</span>
      <input
        class="input input-bordered w-full"
        type="file"
        name="fileList"
        hidden
        use:setAttributeWebkitdirectory
        multiple
        on:change={(evt) => {
          readFiles(evt);
        }}
      />
    </label>
  </form>

  <div class="card bg-base-100 shadow-sm rounded-lg">
    <div class="card-body p-0">
      {#if Object.keys(value).length > 0}
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="pl-4">Name</th>
                <th>Relative Path</th>
                <th>Type</th>
                <th class="text-right pr-4">Size</th>
              </tr>
            </thead>
            <tbody>
              {#each value as file, i}
                <tr>
                  <td class="pl-4">
                    <div class="flex items-center gap-3">
                      <div>
                        <div class="font-medium">{file.name}</div>
                      </div>
                    </div>
                  </td>
                  <td class="max-w-xs truncate">{file.webkitRelativePath || file.name}</td>
                  <td>
                    {#if file.type}
                      {file.type}
                    {:else}
                      unknown
                    {/if}
                  </td>
                  <td class="text-right pr-4 text-sm text-muted">
                    {#if file.size < 1024}
                      {file.size} B
                    {:else if file.size < 1048576}
                      {(file.size / 1024).toFixed(2)} KB
                    {:else if file.size < 1073741824}
                      {(file.size / 1048576).toFixed(2)} MB
                    {:else}
                      {(file.size / 1073741824).toFixed(2)} GB
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="p-6 text-center">
          <svg class="mx-auto mb-2 w-12 h-12 opacity-60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h10a4 4 0 000-8 5 5 0 00-9.9-1.2A4 4 0 003 15z" />
          </svg>
          <div class="text-sm opacity-70">No files selected. Use "Select Folder" to load files.</div>
        </div>
      {/if}
    </div>
  </div>
</div>
