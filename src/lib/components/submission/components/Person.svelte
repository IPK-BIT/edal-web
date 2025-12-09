<script lang="ts">
	import Svelecte from "svelecte";
	import { onMount } from "svelte";

    onMount(()=>{
        if (!person.orcid) {
            editMode = true;
        }
    })

    function handleOrcidFetch(data: {'expanded-result': Array<{'orcid-id': string, 'given-names': string, 'family-names': string, 'institution-name': Array<string>}>}) {
        if (data && data['expanded-result'] && data['expanded-result'].length > 0) {
            let results = data['expanded-result'].map((item) => {
                return {
                    obj: item,
                    text: `${item['given-names']} ${item['family-names']} (${item['institution-name'][0]})`,
                    value: item['orcid-id']
                };
            });
            return results;
        } else {
            return [];
        }
    }

    function handleRoridFetch(data: { items: Array<{ id: string, names: Array<{ types?: string[]; value?: string }> }> }) {
        console.log('ROR data fetched:', data);
        let results = (data.items || []).map((item) => {
            const displayName =
                item.names?.find((n) => Array.isArray(n.types) && n.types.includes('ror_display'))?.value
                || item.names?.[0]?.value
                || '';
            return {
                obj: item,
                text: displayName,
                value: item.id
            }
        })
        return results;
    }

    function syncSignedInUser() {
        let access_token = localStorage.getItem('access_token') || '';
        if (access_token) {
            try {
                let data = JSON.parse(atob(access_token.split('.')[1]));
                person.firstName = data?.given_name || person.firstName;
                person.lastName = data?.family_name || person.lastName;
                // Note: ORCID is not typically included in JWT tokens; this is just an example.
                if (data?.orcid) {
                    person.orcid = data.orcid;
                }
            } catch {
                console.error('Failed to parse access token');
            }
        } else {
            alert('No signed-in user found to sync from.');
        }
    }

    let {
        value: person = $bindable(),
        allowedRoles = [],
        onremovePerson = () => {},
    } = $props();

    let orcid = $state({});
    let rorid = $state({});

    $effect(() => {
        if (
            orcid &&
            typeof orcid === 'object' &&
            'obj' in orcid &&
            orcid.obj &&
            typeof orcid.obj === 'object' &&
            'orcid-id' in (orcid.obj as Record<string, any>)
        ) {
            const newOrcid = (orcid.obj as Record<string, any>)['orcid-id'];
            if (person.orcid !== newOrcid) {
                person.orcid = newOrcid;
                person.firstName = (orcid.obj as Record<string, any>)['given-names'];
                person.lastName = (orcid.obj as Record<string, any>)['family-names'];
            }
        } else if (orcid === '' && person.orcid) {
            // clear person.orcid when selection is cleared
            person.orcid = '';
        }
    });

    $effect(() => {
        console.log('RORID changed:', rorid);
        if (
            rorid &&
            typeof rorid === 'object' &&
            'obj' in rorid &&
            rorid.obj &&
            typeof rorid.obj === 'object' &&
            'id' in (rorid.obj as Record<string, any>)
        ) {
            console.log('Updating person with new RORID');
            const newRorid = (rorid.obj as Record<string, any>)['id'];
            if (person.rorid !== newRorid) {
                person.rorid = newRorid;
                person.affiliation = rorid['text'];
            }
        } else if (rorid === '' && person.rorid) {
            // clear person.orcid when selection is cleared
            person.rorid = '';
        }
    });

    let editMode = $state(false);
</script>

<div class="border rounded-md p-4 overflow-x-auto text-sm bg-base-100" style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);">
    {#if editMode}
    <div class="gap-2">
        <fieldset class="fieldset">
            <legend class="fieldset-legend">AuthorRole<span class="text-red-500">*</span></legend>
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
                    <button class="btn btn-xs btn-error" onclick={() => { orcid = {}; person.orcid=''; person.firstName = ''; person.lastName = ''; }}>Remove</button>
                </div>
            {:else}
             <Svelecte
                bind:value={orcid}
                class="w-full"
                valueAsObject={true}
                placeholder="Search for ORCID by author name"
                fetch="https://pub.orcid.org/v3.0/expanded-search/?q=[query]"
                fetchProps={{ headers: { 'Content-Type': 'application/json' } }}
                fetchCallback={handleOrcidFetch}
            />
            {/if}
        </fieldset>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <fieldset class="fieldset">
                <legend class="fieldset-legend"><span class="label-text">First Name</span></legend>
                <input type="text" class="input input-bordered w-full" bind:value={person.firstName} />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend"><span class="label-text">Last Name</span></legend>
                <input type="text" class="input input-bordered w-full" bind:value={person.lastName} />
            </fieldset>
            <div class="flex justify-end">
                <button class="btn btn-primary btn-outline w-full md:w-auto" onclick={syncSignedInUser}>
                    Sync signed in user info
                </button>
            </div>
        </div>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">ROR ID</legend>
            {#if person.rorid}
                <div class="p-2 border rounded-md flex justify-between items-center" style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);">
                    <span>{person.rorid}</span>
                    <button class="btn btn-xs btn-error" onclick={() => { rorid = {}; person.rorid=''; person.affiliation = ''; }}>Remove</button>
                </div>
            {:else}
             <Svelecte
                bind:value={rorid}
                class="w-full"
                valueAsObject={true}
                placeholder="Search for ROR ID of author's affiliation"
                fetch="https://api.ror.org/v2/organizations?query=[query]"
                fetchProps={{ headers: { 'Content-Type': 'application/json' } }}
                fetchCallback={handleRoridFetch}
            />
            {/if}
        </fieldset>
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

        <button class="btn btn-sm btn-info" onclick={() => {
            if (!person.orcid) {
                alert('Every author needs an ORCID');
                return;
            }
            editMode = false;
        }}>
            Save
        </button>
        <button class="btn btn-sm btn-error" onclick={() => onremovePerson()}>
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
