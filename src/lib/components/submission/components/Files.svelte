<script lang="ts">

  export let value: File[] = [];

  function readFiles(evt: Event) {
    //@ts-ignore
    value = evt.target ? evt.target.files : [];
  }

  function setAttributeWebkitdirectory(node: any) {
    node.setAttribute("webkitdirectory", "");
  }
</script>

<form class="form-control">
  <input
    class="input input-bordered p-2"
    type="file"
    name="fileList"
    use:setAttributeWebkitdirectory
    multiple
    on:change={(evt) => {
      readFiles(evt);
    }}
  />
</form>
<div class="bg-white p-2 rounded-lg">
  <table class="table w-full">
    <!-- head -->
    <thead>
      <tr>
        <th>Name</th>
        <th>Relative Path</th>
        <th>File Type</th>
        <th>Size</th>
      </tr>
    </thead>
    <tbody>
      {#each value as file, i}
        <tr>
          <td>{file.name}</td>
          <td>{file.webkitRelativePath}</td>
          <td>{file.type}</td>
          <td>{file.size}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>