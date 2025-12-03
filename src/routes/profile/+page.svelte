<script lang="ts">
    import { onMount } from "svelte";

    let access_token = '';
    let data: any = {};

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

<div class="flex justify-center mt-8">
    {#if access_token}
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
            <div class="card-body items-center text-center">
                <div class="avatar">
                    <div class="w-24 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl">
                        {#if data?.preferred_username}
                            {data.preferred_username[0].toUpperCase()}
                        {:else}
                            ?
                        {/if}
                    </div>
                </div>

                <h2 class="card-title mt-2">
                    {data?.preferred_username ?? 'User'}
                    <span class="badge badge-secondary ml-2">Profile</span>
                </h2>
                <p class="text-sm text-gray-500">Account information</p>

                <div class="w-full mt-4">
                    <div class="grid grid-cols-2 gap-2 text-left">
                        <div class="font-medium">Username</div>
                        <div>{data?.preferred_username ?? '—'}</div>

                        <div class="font-medium">Email</div>
                        <div>{data?.email ?? '—'}</div>

                        <div class="font-medium">First Name</div>
                        <div>{data?.given_name ?? '—'}</div>

                        <div class="font-medium">Last Name</div>
                        <div>{data?.family_name ?? '—'}</div>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="card w-full max-w-md bg-base-200 shadow-md">
            <div class="card-body text-center">
                <h2 class="card-title">Please log in</h2>
                <p class="text-sm text-gray-500">Log in to view your profile information.</p>
                <div class="card-actions justify-center mt-4">
                    <a href="/login" class="btn btn-outline">Go to Login</a>
                </div>
            </div>
        </div>
    {/if}
</div>