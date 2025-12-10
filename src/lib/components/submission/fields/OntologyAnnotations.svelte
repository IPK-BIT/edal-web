<script lang="ts">
    import { onMount } from "svelte";

    let {
        label = '',
        showLabel = true,
        api = 'https://api.terminology.tib.eu/api/',
        query = '*',
        selectionChangedEvent = (selectedOptions: {label: String, iri: String, ontology_name: String, type: string})=>{console.log(selectedOptions)},
        parameter = 'collection=DataPLANT',
        className = undefined,
        value = $bindable()
    } = $props();

onMount(()=>{
    //@ts-ignore
    window['ts4nfdiWidgets'].createAutocomplete(
        {
            api: api,
            parameter: parameter,
            selectionChangedEvent: updateValue,
            preselected: [],
            placeholder: "Type to search...",
            hasShortSelectedLabel: true,
            allowCustomTerms: true,
            singleSelection: true,
            ts4nfdiGateway: false,
            singleSuggestionRow: false,
            showApiSource: true,
            className: className,
            initialSearchQuery: "undefined"
        },
        document.querySelector('#autocomplete_widget_container_24')
    )
});

function updateValue(selectedOptions: [{label: String, iri: String, ontology_name: String, type: string}]) {
    console.log("Selected option:", selectedOptions);
    if (selectedOptions.length > 0) {
        value = [...value, selectedOptions[0].label];
    }
}

</script>

<section class="px-4">
    <fieldset class="fieldset">
        {#if showLabel}
        <legend class="fieldset-legend">{label}</legend>
        {/if}
        {#if value.length > 0}
        <ul class="py-4 px-2">
            {#each value as subject, i}
                <li class="flex justify-between p-1 hover:bg-base-300">
                    <p>{subject}</p>
                    <button class="btn btn-circle btn-error btn-xs" onclick={()=>value = value.filter((s, index) => index !== i)}>X</button>
                </li>
            {/each}
        </ul>
        {/if}
        <div id="autocomplete_widget_container_24"></div>
    </fieldset>
</section>