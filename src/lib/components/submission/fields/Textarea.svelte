<script lang="ts">
    let {
        label = '',
        lvl = '',
        attr,
        value = $bindable(),
        showLabel = true,
        focus = false
    } = $props();

    if (!label) {
        label = attr;
    }
</script>

<section class="px-4">
    <fieldset class="fieldset">
        {#if showLabel}
        <legend class="fieldset-legend">{label}</legend>
        {/if}
        <textarea class="input w-full h-38 p-2 resize-vertical text-justify" bind:value={value} wrap="hard" style="white-space: pre-wrap; overflow-wrap: break-word;"></textarea>
    </fieldset>
</section>