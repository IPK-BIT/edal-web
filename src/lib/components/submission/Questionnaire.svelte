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
        let access_token = localStorage.getItem('access_token');

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