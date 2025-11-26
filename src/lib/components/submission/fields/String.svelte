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
        <input type="text" class="input w-full" bind:value={value} />
    </fieldset>
</section>