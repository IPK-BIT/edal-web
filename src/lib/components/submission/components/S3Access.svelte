<script lang="ts">
	import Schemas from '$lib/js';

	let responseText = $state('');

	let { value = $bindable() } = $props();

	if (Object.keys(value).length === 0) {
		value = Schemas.getObjectFromSchema('s3-connection-details');
	}

	async function testConnection() {
		const response = await fetch(
			'https://dmz-web-169.ipk-gatersleben.de/submission/upload/s3check',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('access_token')}`
				},
				body: JSON.stringify(value)
			}
		);
		if (response.status === 200) {
			responseText = await response.text();
			value.validated = true;
			value.validationMsg = responseText;
		} else {
			responseText = `Connection test failed with status ${response.status}`;
			value.validated = false;
			value.validationMsg = responseText;
		}
	}
</script>

<div>
	<fieldset class="fieldset">
		<legend class="fieldset-legend"><span class="label-text">Endpoint</span></legend>
		<input type="text" class="input-bordered input w-full" bind:value={value.endpoint} />
	</fieldset>
	<fieldset class="fieldset">
		<legend class="fieldset-legend"><span class="label-text">Region</span></legend>
		<input type="text" class="input-bordered input w-full" bind:value={value.region} />
	</fieldset>
	<fieldset class="fieldset">
		<legend class="fieldset-legend"><span class="label-text">Bucket</span></legend>
		<input type="text" class="input-bordered input w-full" bind:value={value.bucket} />
	</fieldset>
	<fieldset class="fieldset">
		<legend class="fieldset-legend"><span class="label-text">Access Key ID</span></legend>
		<input type="text" class="input-bordered input w-full" bind:value={value.accessKey} />
	</fieldset>
	<fieldset class="fieldset">
		<legend class="fieldset-legend"><span class="label-text">Secret Access Key</span></legend>
		<input type="password" class="input-bordered input w-full" bind:value={value.secretKey} />
	</fieldset>
	<button class="btn mt-4 w-full btn-outline btn-secondary" onclick={testConnection}>
		Test Connection
	</button>
	{#if responseText}
		<span class="font-mono text-sm">
			{responseText}
		</span>
	{/if}
</div>
