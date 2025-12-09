<script lang="ts">
	import Schemas from "$lib/js";
	import Person from "./Person.svelte";

    let {
        value: people = $bindable(),
        componentConfig = {}
    } = $props();

    $inspect(people);

    function addPerson() {
        people = [...people, Schemas.getObjectFromSchema('person')];
    }

    function removePerson(index: number) {
        people = people.filter((_: any, i: number) => i !== index);
    }
</script>

<section class="px-4">
    <fieldset class="fieldset">
        <legend class="fieldset-legend">Authors</legend>
        <div class="space-y-4 mb-4">
            {#each people as person, index (index)}
                <Person bind:value={people[index]} onremovePerson={() => removePerson(index)} allowedRoles={componentConfig.allowedRoles} />
            {/each}
        </div>
        <div>
            <button class="btn btn-accent btn-sm" onclick={addPerson}>
                Add Author
            </button>
        </div>        
    </fieldset>
</section>