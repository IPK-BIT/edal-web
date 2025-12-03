<script>
    export let component;
    export let jsonPath = undefined;
    export let componentConfig = {};
    export let validated = () => true;

    import { datasetObj } from "$lib/stores/dataset";

    let value;

    if (jsonPath && datasetObj.keyed) {
        if (jsonPath === '.') {
            value = datasetObj;
        } else {
            value = datasetObj.keyed(jsonPath);
        }
    }

</script>

<svelte:component 
    this={component} 
    bind:value={$value}
    jsonPath={jsonPath}
    {componentConfig}
/>