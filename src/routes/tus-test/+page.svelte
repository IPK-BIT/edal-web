<script>
  import * as tus from 'tus-js-client';
  let file = null;
  let uploadStatus = '';
  let uploadPercentage = 0;

  function handleFileChange(event) {
    file = event.target.files[0];
    uploadStatus = '';
    uploadPercentage = 0;
  }

  function startUpload() {
    if (!file) {
      uploadStatus = 'No file selected.';
      return;
    }

    const upload = new tus.Upload(file, {
      endpoint: '/tus-receiver',
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type
      },
      onError: function (error) {
        uploadStatus = `Upload failed: ${error}`;
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        uploadPercentage = Math.floor((bytesUploaded / bytesTotal) * 100);
      },
      onSuccess: function () {
        uploadStatus = 'Upload finished!';
        uploadPercentage = 100;
      }
    });

    upload.start();
    uploadStatus = 'Uploading...';
  }
</script>

<h1>tus-js-client Simple Upload Example</h1>
<input type="file" on:change={handleFileChange} />
<button on:click={startUpload} disabled={!file}>Upload</button>

{#if uploadStatus}
  <p>{uploadStatus}</p>
{/if}

{#if uploadPercentage > 0}
  <progress value={uploadPercentage} max="100"></progress>
  <span>{uploadPercentage}%</span>
{/if}
