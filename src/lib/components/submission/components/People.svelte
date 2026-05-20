<script lang="ts">
	import Schemas from '$lib/js';
	import Person from './Person.svelte';

	let { value: people = $bindable(), componentConfig = {} } = $props();

	$inspect(people);

	function addPerson() {
		people = [...people, Schemas.getObjectFromSchema('person')];
	}

	function removePerson(index: number) {
		people = people.filter((_: any, i: number) => i !== index);
	}

	function importPeople() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (event: any) => {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.onload = (e: any) => {
				try {
					const importedPeople = JSON.parse(e.target.result);
					if (Array.isArray(importedPeople)) {
						people = [...people, ...importedPeople];
					} else {
						alert('Invalid file format. Please upload a JSON array of people.');
					}
				} catch (error) {
					alert('Error parsing file. Please ensure it is a valid JSON file.');
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	function exportPeople() {
		const dataStr = JSON.stringify(people, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'authors.json';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<section class="px-4">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Authors</legend>
		<div class="mb-4 space-y-4">
			{#each people as person, index (index)}
				<Person
					bind:value={people[index]}
					onremovePerson={() => removePerson(index)}
					allowedRoles={componentConfig.allowedRoles}
				/>
			{/each}
		</div>
		<div>
			<button class="btn btn-sm btn-accent" onclick={addPerson}> Add Author </button>
			<!-- change popover-1 and --anchor-1 names. Use unique names for each dropdown -->
			<button
				class="btn btn-outline btn-sm btn-secondary"
				popovertarget="popover-1"
				style="anchor-name:--anchor-1"
			>
				Import/Export
			</button>
			<ul
				class="menu dropdown w-52 rounded-box bg-base-100 shadow-sm"
				popover
				id="popover-1"
				style="position-anchor:--anchor-1"
			>
				<li><button class="" onclick={importPeople}> Import Authors </button></li>
				<li><button class="" onclick={exportPeople}> Export Authors </button></li>
			</ul>
		</div>
	</fieldset>
</section>
