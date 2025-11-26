<script>
export let component;
export let field;
export let jsonPath = undefined;

import { datasetObj } from "$lib/stores/dataset";

let value;

if (jsonPath && datasetObj.keyed) {
    value = datasetObj.keyed(jsonPath);
} 

</script>

<svelte:component 
    this={component} 
    bind:value={$value} 
    showLabel={true} 
    label={field.label} 
    mapping={field.mapping}
    attr={field.explanation} 
    componentConfig={field.componentConfig}
/>