<script lang="ts">
	import Svelecte from 'svelecte';
	import { onMount } from 'svelte';
	import orcidLogo from '$lib/assets/orcid.logo.icon.svg';

	onMount(() => {
		if (!person.orcid) {
			editMode = true;
		}
	});

	function handleOrcidFetch(data: {
		'expanded-result': Array<{
			'orcid-id': string;
			'given-names': string;
			'family-names': string;
			'institution-name': Array<string>;
		}>;
	}) {
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

	function handleRoridFetch(data: {
		items: Array<{ id: string; names: Array<{ types?: string[]; value?: string }> }>;
	}) {
		let results = (data.items || []).map((item) => {
			const displayName =
				item.names?.find((n) => Array.isArray(n.types) && n.types.includes('ror_display'))?.value ||
				item.names?.[0]?.value ||
				'';
			return {
				obj: item,
				text: displayName,
				value: item.id
			};
		});
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

	let { value: person = $bindable(), allowedRoles = [], onremovePerson = () => {} } = $props();

	let orcid = $state({});
	let rorid = $state({});

	$effect(() => {
		if (
			orcid &&
			typeof orcid === 'object' &&
			'obj' in orcid &&
			orcid.obj &&
			typeof orcid.obj === 'object' &&
			'orcid-id' in (orcid.obj as Record<string, unknown>)
		) {
			const newOrcid = (orcid.obj as Record<string, unknown>)['orcid-id'];
			if (person.orcid !== newOrcid) {
				person.orcid = newOrcid;
				person.firstName = (orcid.obj as Record<string, unknown>)['given-names'];
				person.lastName = (orcid.obj as Record<string, unknown>)['family-names'];
			}
		} else if (orcid === '' && person.orcid) {
			// clear person.orcid when selection is cleared
			person.orcid = '';
		}
	});

	$effect(() => {
		if (
			rorid &&
			typeof rorid === 'object' &&
			'obj' in rorid &&
			rorid.obj &&
			typeof rorid.obj === 'object' &&
			'id' in (rorid.obj as Record<string, unknown>)
		) {
			const newRorid = (rorid.obj as Record<string, unknown>)['id'];
			if (person.rorid !== newRorid) {
				person.rorid = newRorid;
				// TS: rorid may be a complex object; safely cast via unknown to satisfy TS
				person.affiliation = (rorid as unknown as { text: string }).text || '';
			}
		} else if (rorid === '' && person.rorid) {
			// clear person.orcid when selection is cleared
			person.rorid = '';
		}
	});

	let editMode = $state(false);
</script>

<div
	class="overflow-x-auto rounded-md border bg-base-100 p-4 text-sm"
	style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
>
	{#if editMode}
		<div class="gap-2">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">AuthorRole<span class="text-red-500">*</span></legend>
				<div
					style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
					class="flex flex-wrap gap-4 rounded-md border p-2"
				>
					{#each allowedRoles as role (role)}
						<label class="mr-4 inline-flex items-center">
							<input
								type="radio"
								class="radio radio-sm"
								name="authorRole-{person.id}"
								value={role.value}
								bind:group={person.role}
							/>
							<span class="ml-2" title={role.tooltip} aria-label={role.tooltip}>
								{role.label}
								{#if role.tooltip}
									<span class="text-sm" title={role.tooltip} aria-hidden="true"> &#9432; </span>
								{/if}
							</span>
						</label>
					{/each}
				</div>
			</fieldset>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">ORCID</legend>
				{#if person.orcid}
					<div
						class="flex items-center justify-between rounded-md border p-2"
						style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
					>
						<span>{person.orcid}</span>
						<button
							class="btn btn-xs btn-error"
							onclick={() => {
								orcid = {};
								person.orcid = '';
								person.firstName = '';
								person.lastName = '';
							}}>Remove</button
						>
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
			<div class="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
				<fieldset class="fieldset">
					<legend class="fieldset-legend"><span class="label-text">First Name</span></legend>
					<input type="text" class="input-bordered input w-full" bind:value={person.firstName} />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend"><span class="label-text">Last Name</span></legend>
					<input type="text" class="input-bordered input w-full" bind:value={person.lastName} />
				</fieldset>
				<div class="flex justify-end">
					<button class="btn w-full btn-outline btn-primary md:w-auto" onclick={syncSignedInUser}>
						Sync signed in user info
					</button>
				</div>
			</div>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">ROR ID</legend>
				{#if person.rorid}
					<div
						class="flex items-center justify-between rounded-md border p-2"
						style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
					>
						<span>{person.rorid}</span>
						<button
							class="btn btn-xs btn-error"
							onclick={() => {
								rorid = {};
								person.rorid = '';
								person.affiliation = '';
							}}>Remove</button
						>
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
				<legend class="fieldset-legend">City</legend>
				<input type="text" class="input w-full" bind:value={person.city} />
			</fieldset>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Zip Code</legend>
				<input type="text" class="input w-full" bind:value={person.zipCode} />
			</fieldset>
			<fieldset class="mb-2 fieldset">
				<legend class="fieldset-legend">Country</legend>
				<input type="text" class="input w-full" bind:value={person.country} />
			</fieldset>

			<button
				class="btn btn-sm btn-info"
				onclick={() => {
					if (!person.orcid) {
						alert('Every author needs an ORCID');
						return;
					}
					editMode = false;
				}}
			>
				Save
			</button>
			<button class="btn btn-sm btn-error" onclick={() => onremovePerson()}>
				Remove {person.givenName || 'Person'}
			</button>
		</div>
	{:else}
		<div class="flex items-center">
			<span
				class="badge {person.role === 'Creator'
					? 'badge-primary'
					: person.role === 'Contributor'
						? 'badge-secondary'
						: 'badge-accent'} mr-2"
			>
				{person.role}
			</span>
			<span class="font-bold">{person.firstName} {person.lastName}</span>
			{#if person.orcid}
				<a
					class="ml-1 text-sm text-blue-600 hover:underline"
					href={'https://orcid.org/' + person.orcid}
					target="_blank"
					rel="noopener noreferrer"
				>
					<img src={orcidLogo} alt="ORCID Logo" class="inline h-4 w-4" />
				</a>
			{/if}
			{#if person.affiliation}
				<span class="ml-2 text-sm italic">{person.affiliation}</span>
			{/if}
			<div class="ml-auto flex space-x-2">
				<button class="btn btn-sm btn-info" onclick={() => (editMode = true)}> Edit </button>
				<button class="btn btn-sm btn-error" onclick={() => onremovePerson()}> Remove </button>
			</div>
		</div>
	{/if}
</div>
