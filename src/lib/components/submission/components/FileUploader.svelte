<script lang="ts">

  export let value: File[] = [];

  function readFiles(evt: Event) {
    //@ts-ignore
    value = {};
    let tmp = evt.target ? evt.target.files : {};
    for (let i = 0; i < tmp.length; i++) {
      safeAddFile(tmp[i]);
    }
    value = value;
  }

  function safeAddFile(file: File) {
    // Skip hidden files
    if (file.name.startsWith('.')) {
      return;
    }
    // Skip temporary files
    if (file.name.endsWith('~') || file.name.endsWith('.swp')) {
      return;
    }
    // Skip files in hidden directories
    let pathParts = file.webkitRelativePath.split('/');
    for (let part of pathParts) {
      if (part.startsWith('.')) {
        return;
      }
    }
    // Skip compression files
    const compressionExtensions = ['.zip', '.tar', '.gz', '.bz2', '.7z', '.xz'];
    for (let ext of compressionExtensions) {
      if (file.name.endsWith(ext)) {
        return;
      }
    }
    value[Object.keys(value).length] = file;
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
        onchange={(evt) => {
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each Object.keys(value) as key, i}
                <tr class="{value[key].size===0?'bg-warning/50':''}">
                  <td class="pl-4">
                    <div class="flex items-center gap-3">
                      <div>
                        <div class="font-medium">{value[key].name}</div> 
                      </div>
                    </div>
                  </td>
                  <td class="max-w-xs truncate">{value[key].webkitRelativePath || value[key].name}</td>
                  <td>
                    {#if value[key].type}
                      {value[key].type}
                    {:else}
                      unknown
                    {/if}
                  </td>
                  <td class="text-right pr-4 text-sm text-muted">
                    {#if value[key].size < 1024}
                      {value[key].size} B
                    {:else if value[key].size < 1048576}
                      {(value[key].size / 1024).toFixed(2)} KB
                    {:else if value[key].size < 1073741824}
                      {(value[key].size / 1048576).toFixed(2)} MB
                    {:else}
                      {(value[key].size / 1073741824).toFixed(2)} GB
                    {/if}
                  </td>
                  <td class="pr-4 text-right">
                    <button aria-label="remove file" class="btn btn-xs btn-circle btn-ghost" onclick={() => {
                      delete value[key];
                      value = value;
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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
