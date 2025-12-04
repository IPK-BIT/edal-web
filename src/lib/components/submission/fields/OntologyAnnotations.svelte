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
            singleSelection: false,
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
    console.log(selectedOptions);
    value = selectedOptions.map(option => option.label);
}

</script>

<section class="px-4">
    <fieldset class="fieldset">
        {#if showLabel}
        <legend class="fieldset-legend">{label}</legend>
        {/if}
        <div id="autocomplete_widget_container_24"></div>
    </fieldset>
</section>