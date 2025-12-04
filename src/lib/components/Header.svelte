<script lang="ts">
    import banner from '$lib/assets/header_bg2.png';
    import logo from '$lib/assets/edal_logo.png';
	import { onMount } from 'svelte';
    import generalConfig from '$lib/config/general.json';
    import { generateCodeChallenge, generateCodeVerifier } from '$lib/js/oidc';

    let accesToken: string | null = null;

    let codeVerifier = '';
    let codeChallenge = '';

    let oidcConfig: any = {};

    onMount(async ()=> {
        const response = await fetch(generalConfig.aai['openid-configuration']);
        oidcConfig = await response.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            console.log('Authorization code returned:', code);
            codeVerifier = localStorage.getItem('code_verifier') || '';
            let data = {
                grant_type: 'authorization_code',
                code: code,
                client_id: generalConfig.aai['client-id'],
                redirect_uri: window.location.origin,
                code_verifier: codeVerifier
            }

            let response = await fetch(oidcConfig.token_endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(data).toString()
            });

            let tokenResponse = await response.json();
            console.log('Token response:', tokenResponse);
            localStorage.setItem('access_token', tokenResponse.access_token);
            localStorage.setItem('refresh_token', tokenResponse.refresh_token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        accesToken = localStorage.getItem('access_token');

        codeVerifier = generateCodeVerifier();
        codeChallenge = await generateCodeChallenge(codeVerifier);

        localStorage.setItem('code_verifier', codeVerifier);
    });

    function login() {
        let clientId = generalConfig.aai['client-id'];

        console.log('Redirecting to AAI login...');

        let auth_url = oidcConfig.authorization_endpoint;

        const params = {
            response_type: 'code',
            client_id: clientId,
            redirect_uri: window.location.origin,
            scope: 'openid profile email',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        }

        const urlParams = new URLSearchParams(params).toString();
        window.location.href = `${auth_url}?${urlParams}`;
    }

    function logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        accesToken = null;
        window.location.href = '/';
    }
</script>

<div class="navbar bg-base-100 shadow-sm w-full">
  <div class="navbar-start gap-2">
    <details class="dropdown">
        <summary class="btn m-1 btn-square btn-ghost" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
        </summary>
        <ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li><a href="/submit">Submission</a></li>
            <li><a href="/search">Search</a></li>
        </ul>
    </details>
    <a href="/" class="" aria-label="edal-logo">
        <img src={logo} class="select-none" alt="e!DAL Logo"/>
    </a>
  </div>
  <div class="navbar-center">
    <span class="text-lg font-semibold">e!DAL - Plant Genomics & Phenomics Research Data Repository</span>
  </div>
  <div class="navbar-end gap-2">
    <details class="dropdown dropdown-end">
        <summary class="btn m-1 btn-square btn-ghost" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-10 w-10 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
        </summary>
        <ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            {#if accesToken}
            <li><a href="/profile">Profile</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><button onclick={logout} class="hover:bg-error hover:text-error-content">Logout</button></li>
            {:else}
            <li><button onclick={login}>Login</button></li>
            {/if}
        </ul>
    </details>
  </div>
</div>
<div>
    <img
        src={banner}
        alt="Header Banner"
        class="w-full h-8 object-cover bg-secondary border-b-4 border-t-4 border-double select-none"
    />
</div>