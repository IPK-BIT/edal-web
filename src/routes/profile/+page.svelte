<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let access_token = $state('');
	let data: Record<string, unknown> = $state({});

	onMount(() => {
		access_token = localStorage.getItem('access_token') || '';
		if (access_token) {
			try {
				data = JSON.parse(atob(access_token.split('.')[1]));
			} catch {
				data = {};
			}
		}
	});
</script>

<div class="mt-8 flex justify-center">
	{#if access_token}
		<div class="card w-full max-w-md bg-base-100 shadow-xl">
			<div class="card-body items-center text-center">
				<div class="avatar">
					<div
						class="flex w-24 items-center justify-center rounded-full bg-primary text-2xl text-primary-content"
					>
						{#if data?.preferred_username as string | undefined}
							{(data.preferred_username as string)[0].toUpperCase()}
						{:else}
							?
						{/if}
					</div>
				</div>

				<h2 class="mt-2 card-title">
					{(data?.preferred_username as string) ?? 'User'}
					<span class="ml-2 badge badge-secondary">Profile</span>
				</h2>
				<p class="text-sm text-gray-500">Account information</p>

				<div class="mt-4 w-full">
					<div class="grid grid-cols-2 gap-2 text-left">
						<div class="font-medium">Username</div>
						<div>{(data?.preferred_username as string) ?? '—'}</div>

						<div class="font-medium">Email</div>
						<div>{(data?.email as string) ?? '—'}</div>

						<div class="font-medium">First Name</div>
						<div>{(data?.given_name as string) ?? '—'}</div>

						<div class="font-medium">Last Name</div>
						<div>{(data?.family_name as string) ?? '—'}</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="card w-full max-w-md bg-base-200 shadow-md">
			<div class="card-body text-center">
				<h2 class="card-title">Please log in</h2>
				<p class="text-sm text-gray-500">Log in to view your profile information.</p>
				<div class="mt-4 card-actions justify-center">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<button class="btn btn-outline" onclick={() => goto('/login')}>Go to Login</button>
					<!-- eslint-enable-next-line svelte/no-navigation-without-resolve -->
				</div>
			</div>
		</div>
	{/if}
</div>
