<script lang="ts">
    import steps from "$lib/config/steps.json";
    import { currentStep } from "$lib/stores/dataset";

    function jump(index: number) {
        if (index <= $currentStep) {
            $currentStep = index;
        }
    }
</script>

<ul class="steps w-full">
    {#each steps as step, index}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <li class="hover:pointer step {index <= $currentStep ? 'step-primary' : ''}" onclick={() => jump(index)}>
                {step.shortTitle}
        </li>
    {/each}
</ul>