<script lang="ts">
	import Svelecte from "svelecte";

    function handleOrcidFetch(data: {'expanded-result': Array<{'orcid-id': string, 'given-names': string, 'family-names': string, 'institution-name': Array<string>}>}) {
        if (data && data['expanded-result'] && data['expanded-result'].length > 0) {
            let results = data['expanded-result'].map((item) => {
                return {
                    obj: item,
                    text: `${item['given-names']} ${item['family-names']} (${item['institution-name'][0]})`,
                    value: item['orcid-id']
                };
            });
            console.log('ORCID results:', results);
            return results;
        } else {
            console.log('No ORCID results found');
            return [];
        }
    }

    let {
        value: person = $bindable(),
        allowedRoles = [],
        onremovePerson = () => {}
    } = $props();

    let editMode = $state(false);
</script>

<div class="border rounded-md p-4 overflow-x-auto text-sm bg-base-100" style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);">
    {#if editMode}
    <div class="gap-2">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">AuthorRole</legend>
            <div style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);" class="p-2 border rounded-md flex flex-wrap gap-4">
                {#each allowedRoles as role}
                    <label class="inline-flex items-center mr-4">
                        <input type="radio" class="radio radio-sm" name="authorRole-{person.id}" value={role.value} bind:group={person.role} />
                        <span class="ml-2">{role.label}</span>
                    </label>
                {/each}
            </div>
        </fieldset>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">ORCID</legend>
            {#if person.orcid}
                <div class="p-2 border rounded-md flex justify-between items-center" style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);">
                    <span>{person.orcid}</span>
                    <button class="btn btn-xs btn-warning" onclick={() => { person.orcid = ''; }}>Remove</button>
                </div>
            {:else}
             <Svelecte
                bind:value={person.orcid}
                class="w-full"
                valueAsObject={false}
                placeholder="Search for ORCID of author"
                fetch="https://pub.orcid.org/v3.0/expanded-search/?q=[query]"
                fetchProps={{ headers: { 'Content-Type': 'application/json' } }}
                fetchCallback={handleOrcidFetch}
            />
            {/if}
        </fieldset>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">First Name</legend>
                <input type="text" class="input w-full" bind:value={person.firstName} />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Last Name</legend>
                <input type="text" class="input w-full" bind:value={person.lastName} />
            </fieldset>
        </div>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Affiliation</legend>
            <input type="text" class="input w-full" bind:value={person.affiliation} />
        </fieldset>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Address</legend>
            <input type="text" class="input w-full" bind:value={person.address} />
        </fieldset>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Zip Code</legend>
            <input type="text" class="input w-full" bind:value={person.zipCode} />
        </fieldset>
        <fieldset class="fieldset mb-2">
            <legend class="fieldset-legend">Country</legend>
            <input type="text" class="input w-full" bind:value={person.country} />
        </fieldset>
        
        <button class="btn btn-sm btn-info" onclick={() => editMode = false}>
            Stop Editing
        </button>
        <button class="btn btn-sm btn-error" onclick={() => editMode = false}>
            Remove {person.givenName || 'Person'}
        </button>
    </div>
    {:else}
    <div class="flex">
        <div class="w-full flex flex-col space-y-2">
            <span>{person.role ? `Role: ${person.role}` : ''}</span>
            <span>{person.firstName} {person.lastName} {person.orcid ? `(ORCID: ${person.orcid})` : ''}</span>
            <span>{person.address ? `Address: ${person.address}` : ''}</span>
            <span>{person.zipCode ? `Zip Code: ${person.zipCode}` : ''}</span>
            <span>{person.country ? `Country: ${person.country}` : ''}</span>
        </div>
        <div class="flex flex-col">
            <button class="btn btn-sm btn-info mt-2" onclick={() => editMode = true}>
                Edit
            </button>
            <button class="btn btn-sm btn-error mt-2" onclick={() => onremovePerson()}>
                Remove
            </button>
        </div>    
    </div>
    {/if}
</div>
