<script lang="ts">
	import FieldWrapper from "./wrapper/FieldWrapper.svelte";
	import ComponentWrapper from "./wrapper/ComponentWrapper.svelte";
	import String from "./fields/String.svelte";
    import steps from "$lib/config/steps.json";
	import Textarea from "./fields/Textarea.svelte";
	import License from "./fields/License.svelte";
    import OntologyAnnotations from "./fields/OntologyAnnotations.svelte";
	import People from "./components/People.svelte";
	import Files from "./components/Files.svelte";
    import Dla from "./components/Dla.svelte";
	import { datasetObj } from "$lib/stores/dataset";
	import { onMount } from "svelte";
	import Schemas from "$lib/js";
    import { currentStep } from "$lib/stores/dataset";

    // let $currentStep = $state(0);

    const fieldTypes = {
        'string': String,
        'textarea': Textarea,
        'license': License,
        'onto-autocomplete': OntologyAnnotations
    }

    const componentTypes = {
        'people': People,
        'files': Files,
        'dla': Dla,
    }

    onMount(()=>{
        if ($currentStep === 0) {
            executeHook($currentStep);
        }
    })

    function executeHook(idx: number) {
        console.log("Executing hook for step:", idx);
        if (steps[idx] && steps[idx].hooks && Array.isArray(steps[idx].hooks)) {
            console.log("Found hooks:", steps[idx].hooks);
            steps[idx].hooks.forEach((hook) => {
                if (datasetObj.keyed) {
                    console.log("Executing hook for type:", hook.type);
                    let obj = datasetObj.keyed(hook.state.mapping);
                    let emptyObj = Schemas.getObjectFromSchema(hook.type)
                    if (hook.state.count === 1) {
                        obj.set(emptyObj);
                        console.log("Initialized single object for", hook.type, obj);
                    }
                }
            })
        }
    }

    function handleKeypress(event: KeyboardEvent) {

    }

    function getValueByPath(obj, path) {
        // path: "metadata.title" etc
        return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
    }

    function next() {
        // Validate required fields for the current step
        const step = steps[$currentStep];
        if (step.fields) {
            const missing = [];
            for (const field of step.fields) {
                if (field.required) {
                    const value = getValueByPath($datasetObj, field.mapping.jsonPath);
                    if (
                        value === undefined ||
                        value === null ||
                        (typeof value === 'string' && value.trim() === '')
                    ) {
                        missing.push(field.label);
                    }
                }
            }
            if (missing.length > 0) {
                alert("Please fill out the following required field(s):\n" + missing.join(", "));
                return;
            }
        }
        // Additional validation for authors step
        if (step.jsonPath === "metadata.authors") {
            const authors = $datasetObj.metadata?.authors || [];
            const hasCreator = authors.some((author) => author.role === "Creator");
            if (!hasCreator) {
                alert("You need to specify at least one author with the Creator role.");
                return;
            }
        }

        // Additional validation for DLA step
        if (step.jsonPath === "dlaRead") {
            if (!$datasetObj.dlaRead) {
                alert("You must read the Data Deposition and License Agreement (DDLA) prior to proceeding.");
                return;
            }
        }

        if ($currentStep < steps.length - 1) {
            $currentStep += 1;
            executeHook($currentStep);
        }
    }

    function prev() {
        if ($currentStep > 0) {
            $currentStep -= 1;
        }
    }

    let validated;

    let index = 0;
    let fileId = $state(0);

    function finish() {
        if (!confirm("You are about to finish the submission. Do you want to continue?")) {
            return;
        }

        let access_token = localStorage.getItem('access_token');

        if($datasetObj.file_transfer_mode === "manual_upload") {
          console.log($datasetObj.files)
          //@ts-ignore
          if (Object.keys($datasetObj.files).length === 0) {
              alert("Please upload at least one file before finishing the submission.");
              return;
          }
          //@ts-ignore
          const fileQueue = new Array($datasetObj.files.length).fill().map((_, i) => i).reverse();
          let activeConnections = 0, threadsQuantity = 10;
          sendNextFile();

          function sendNextFile() {
              if (activeConnections >= threadsQuantity) {
                  return;
              }
              if (!fileQueue.length) {
                  if (!activeConnections) {
                      index = 0;
                      fileId=0;
                      $datasetObj = Schemas.getObjectFromSchema('dataset');
                      executeHook(0);
                      $currentStep=0;
                  }
                  return;
              }
              fileId = fileQueue.pop()!;
              //@ts-ignore
              const file = $datasetObj.files[fileId];
              let formData = new FormData();
              formData.set('file', file, file.name);
              //@ts-ignore
              formData.set('metaData', JSON.stringify($datasetObj.metadata));

              let pathArr = file.webkitRelativePath.split('/');
              //@ts-ignore
              pathArr[0] = $datasetObj.metadata.title;
              let path = pathArr.slice(0, -1).join('/');
              formData.set('path', path);
              activeConnections++;
              let base_url = 'https://dmz-web-169.ipk-gatersleben.de/submission';
              // let base_url = 'http://localhost:8000';
              const resp = fetch(`${base_url}/upload/dataset`, {
                  method: 'POST',
                  body: formData,
                  headers: {
                      'Authorization': `Bearer ${access_token}`
                  }
              }).then((res) => {
                  activeConnections--;
                  sendNextFile();
              }).catch((err) => {
                  console.error("Error uploading file:", err);
                  activeConnections--;
                  fileQueue.push(fileId);
              });
          }
        } else if($datasetObj.file_transfer_mode == "s3") {
          const s3 = $datasetObj.s3access || {};
          const missing = [];
          if (!s3.endpoint || s3.endpoint.trim() === "") missing.push("S3 Endpoint URL");
          if (!s3.bucket || s3.bucket.trim() === "") missing.push("Bucket Name");
          if (!s3.accessKey || s3.accessKey.trim() === "") missing.push("Access Key");
          if (!s3.secretKey || s3.secretKey.trim() === "") missing.push("Secret Key");
          if (missing.length > 0) {
              alert("Please fill out the following S3 field(s):\n" + missing.join(", "));
              return;
          }
          let base_url = 'https://dmz-web-169.ipk-gatersleben.de/submission';
          // let base_url = 'http://localhost:8000';
          let formData = new FormData();
          for (const key in $datasetObj) {
              let value = $datasetObj[key];
              if (typeof value === "object") {
                  formData.append(key, JSON.stringify(value));
              } else {
                  formData.append(key, value);
              }
          }
          fetch(`${base_url}/upload/s3`, {
              method: 'POST',
              body: formData,
              headers: {
                  'Authorization': `Bearer ${access_token}`
                  // Do NOT set Content-Type for FormData, browser will handle it
              }
          }).then((res) => {
          }).catch((err) => {
              console.error("Error submitting S3 info:", err);
          });
        }
    }

</script>

{#if steps.length > 0}

<section class="border border-neutral-300 rounded-lg p-4">

    <h2 class="text-2xl font-bold">Step {$currentStep+1} of {steps.length}</h2>
    <p class="font-semibold text-neutral-500 m-2">{steps[$currentStep].title}</p>

    <div class="p-0">
        <div onkeypress={handleKeypress} role="button" tabindex="0" aria-pressed="false">
            {#key $currentStep}
                {#if steps[$currentStep].text}
                    {#each steps[$currentStep].text as paragraph}
                    <p class="mx-4 text-neutral-600 text-sm">{paragraph}</p>
                    {/each}
                {/if}

                {#if steps[$currentStep].fields}
                    {#each steps[$currentStep].fields as field}
                    <FieldWrapper component={fieldTypes[field.type as keyof typeof fieldTypes]} jsonPath={field.mapping.jsonPath} field={field} />
                    {/each}
                {/if}

                {#if steps[$currentStep].component}
                    <ComponentWrapper
                        component={componentTypes[steps[$currentStep].component as keyof typeof componentTypes]}
                        jsonPath={steps[$currentStep].jsonPath}
                        componentConfig={steps[$currentStep].componentConfig}
                        validated={validated}
                    />
                {/if}
            {/key}
        </div>
    </div>

    <div class="divider"></div>

    <div class="m-2 flow-root">
        {#if $currentStep > 0}
        <button class="btn btn-secondary" onclick={prev}>Previous</button>
        {/if}

        {#if $currentStep === 0}
        <button class="btn btn-primary float-right" onclick={next}>I agree</button>
        {:else if $currentStep < steps.length - 1}
        <button class="btn btn-primary float-right" onclick={next}>Next</button>
        {:else}
        <button class="btn btn-primary float-right" onclick={finish}>Finish</button>
        {/if}
    </div>
</section>
{/if}
