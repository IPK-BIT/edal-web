<script lang="ts">
	import FieldWrapper from "./wrapper/FieldWrapper.svelte";
	import ComponentWrapper from "./wrapper/ComponentWrapper.svelte";
	import String from "./fields/String.svelte";
    import steps from "$lib/config/steps.json";
	import Textarea from "./fields/Textarea.svelte";
	import License from "./fields/License.svelte";
	import People from "./components/People.svelte";
	import Files from "./components/Files.svelte";
	import { datasetObj } from "$lib/stores/dataset";
	import { onMount } from "svelte";
	import Schemas from "$lib";

    let currentStep = $state(0);

    const fieldTypes = {
        'string': String,
        'textarea': Textarea,
        'license': License,
    }

    const componentTypes = {
        'people': People,
        'files': Files,
    }

    onMount(()=>{
        if (currentStep === 0) {
            executeHook(currentStep);
        }
    })

    function executeHook(idx: number) {
        if (steps[idx] && steps[idx].hooks && Array.isArray(steps[idx].hooks)) {
            steps[idx].hooks.forEach((hook) => {
                if (datasetObj.keyed) {
                    let obj = datasetObj.keyed(hook.state.mapping);
                    let emptyObj = Schemas.getObjectFromSchema(hook.type)
                    if (hook.state.count === 1) {
                        obj.set(emptyObj);
                    }
                }
            })
        }
    }

    function handleKeypress(event: KeyboardEvent) {
        
    }

    function next() {
        if (currentStep < steps.length - 1) {
            currentStep += 1;
            executeHook(currentStep);
        }
    }

    function prev() {
        if (currentStep > 0) {
            currentStep -= 1;
        }
    }

    let index = 0;
    let fileId = $state(0);

    function finish() {
        //@ts-ignore
        if ($datasetObj.files.length === 0) {
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
                    currentStep=0;
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
            const resp = fetch(`${base_url}/upload/datasets`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ5ckZ5QlVzd0tvakxiT1d2T3J3VTJvc2h5ZGZCVHZ3TVdZVktqb2xMU1dFIn0.eyJleHAiOjE3NjQxNjAyNzIsImlhdCI6MTc2NDE1ODQ3MiwiYXV0aF90aW1lIjoxNzY0MTU4NDcwLCJqdGkiOiJmMWNlOWMyZS0zNTgzLTQ4MGUtOTQ2My1hYTBmMzc3OTY1NmUiLCJpc3MiOiJodHRwOi8vZGV2LnNjb3JwaW9uLmJpLmRlbmJpLmRlL3JlYWxtcy9zY29ycGlvbiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJhOWZjMGZhYy1jMTI5LTQ3MWItOTgyNy04MGQ0Yjc5OTA0NTMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJkZW5iaSIsInNlc3Npb25fc3RhdGUiOiI3NTQ3MmUyNC1lN2RhLTRmMTktYTMxNi03OGZkNWZhN2RjZTciLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLXNjb3JwaW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZGVuYmkiOnsicm9sZXMiOlsiaXBrIiwiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiI3NTQ3MmUyNC1lN2RhLTRmMTktYTMxNi03OGZkNWZhN2RjZTciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6Ik1hbnVlbCBGZXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImZlc2VybSIsImdpdmVuX25hbWUiOiJNYW51ZWwiLCJmYW1pbHlfbmFtZSI6IkZlc2VyIiwiZW1haWwiOiJmZXNlckBpcGstZ2F0ZXJzbGViZW4uZGUifQ.Ow1d8SJQeo30CaNocooFaOA8ndrkrgaHZqgGfHTl6MMJL858DH3XZT6--XlNS8nUQxmoTq4rRq9CuuK1fBuJVWCbd69qSaQZWPna9qyo07CuSBMdRo404pLaut08oJVhUZ7ZqKf6fMxS7W8ZHxyr19IWwf6IFf6POUaYmgEBBgPZx9_dGsr7B6-VupraT5PdZMp-S9EYQ95BrOUP5rJgh1y-7GP1XyI4yPE9tQeyeTyhz24ujMCJhDeNpQJdSlyQM5tIV0ph6xaqnZshumZ7828hcDUySDrFYLtpn2kl_qZ1HZIRwStfjKHs2MXrmIoZu43KYq9YVgeY51VoODZmeg`
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
    }

</script>

{#if steps.length > 0}

<section class="border border-neutral-300 rounded-lg p-4">

    <h2 class="text-2xl font-bold">Step {currentStep+1} of {steps.length}</h2>
    <p class="font-semibold text-neutral-500 m-2">{steps[currentStep].title}</p>
    
    <div class="p-0">
        <div onkeypress={handleKeypress} role="button" tabindex="0" aria-pressed="false">
            {#key currentStep}
                {#if steps[currentStep].text}
                    {#each steps[currentStep].text as paragraph}
                    <p class="mx-4 text-neutral-600 text-sm">{paragraph}</p>
                    {/each}
                {/if}

                {#if steps[currentStep].fields}
                    {#each steps[currentStep].fields as field}
                    <FieldWrapper component={fieldTypes[field.type as keyof typeof fieldTypes]} jsonPath={field.mapping.jsonPath} field={field} />
                    {/each}
                {/if}
            
                {#if steps[currentStep].component}
                    <ComponentWrapper
                        component={componentTypes[steps[currentStep].component as keyof typeof componentTypes]} 
                        jsonPath={steps[currentStep].jsonPath} 
                        componentConfig={steps[currentStep].componentConfig} 
                    />
                {/if}
            {/key}
        </div>
    </div>


    <div class="m-2 flow-root">
        {#if currentStep > 0}
        <button class="btn btn-secondary" onclick={prev}>Previous</button>
        {/if}

        {#if currentStep < steps.length - 1}
        <button class="btn btn-primary float-right" onclick={next}>Next</button>
        {:else}
        <button class="btn btn-primary float-right" onclick={finish}>Finish</button>
        {/if}
    </div>
</section>
{/if}