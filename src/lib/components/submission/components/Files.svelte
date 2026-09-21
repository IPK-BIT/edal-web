<script lang="ts">
	import S3Access from './S3Access.svelte';
	import FileUploader from './FileUploader.svelte';
	import { onMount } from 'svelte';
	import ComponentWrapper from '../wrapper/ComponentWrapper.svelte';
	import ROCrateNavigator from './ROCrateNavigator.svelte';
	import { linkedSubmission } from '$lib/stores/dataset';

	let { value = $bindable(), componentConfig } = $props();

	onMount(() => {
		if ($linkedSubmission) {
			value = 'rocrate';
		} else if (!value) {
			value = componentConfig?.options?.[0]?.value;
		}
	});

	const components = {
		s3: S3Access,
		local: FileUploader
	};
</script>

{#if $linkedSubmission}
	<!-- Files for a linked ARC RO-Crate submission already live in the crate itself,
	     so the local/S3 upload choice below doesn't apply here. Only known, non-secret
	     fields are read from the store - the gitlab_token used to fetch this submission
	     never reaches the client. -->
	<div class="card border border-base-300 bg-base-100 p-4">
		<h3 class="card-title text-base">Linked ARC RO-Crate Submission</h3>
		<p class="text-sm text-neutral">
			Files for this dataset are provided by the linked ARC RO-Crate submission and don't need to be
			uploaded here.
		</p>
		<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
			<dt class="font-semibold">RO-Crate</dt>
			<dd>
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					class="link break-all link-primary"
					href={$linkedSubmission.rocrate_link}
					target="_blank"
					rel="noopener noreferrer"
				>
					{$linkedSubmission.rocrate_link}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</dd>
			<dt class="font-semibold">User ID</dt>
			<dd>{$linkedSubmission.user_id}</dd>
			<dt class="font-semibold">ARC ID</dt>
			<dd>{$linkedSubmission.arc_id}</dd>
			{#if $linkedSubmission.submitted_at}
				<dt class="font-semibold">Submitted</dt>
				<dd>{new Date($linkedSubmission.submitted_at).toLocaleString()}</dd>
			{/if}
		</dl>
	</div>

	<ROCrateNavigator nodes={$linkedSubmission.fileTree} />
{:else}
	<div role="tablist" class="tabs-border tabs">
		{#each componentConfig.options as option (option.value)}
			<button
				role="tab"
				class="tab {value === option.value ? 'tab-active' : ''}"
				onclick={() => {
					value = option.value;
				}}
			>
				{option.label}
			</button>
		{/each}
	</div>

	<div class="p-4">
		{#if components[value as keyof typeof components]}
			{#key value}
				<ComponentWrapper
					component={components[value as keyof typeof components]}
					jsonPath={componentConfig.options.find(
						(option: { value: unknown }) => option.value === value
					).jsonPath}
				/>
			{/key}
		{/if}
	</div>
{/if}
