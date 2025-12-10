<script lang="ts">
    import banner from '$lib/assets/header_bg2.png';
    import logo from '$lib/assets/edal_logo.png';
	import { onMount } from 'svelte';
    import { checkTokenValidity, generateCodeChallenge, generateCodeVerifier, performLogin, renewToken, retrieveOidcConfig, retrieveToken } from '$lib/js/oidc';

    let accesToken: string | null = null;

    let codeVerifier = '';
    let codeChallenge = '';

    let oidcConfig: any = {};

    onMount(()=> {
        let timer: ReturnType<typeof setTimeout>;

        (async ()=> {
            oidcConfig = await retrieveOidcConfig();
            
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            if (code) {
                await retrieveToken(code);
            }

            accesToken = localStorage.getItem('access_token');
            if (accesToken) {
                username = JSON.parse(atob(accesToken.split('.')[1])).preferred_username;
            }

            codeVerifier = generateCodeVerifier();
            codeChallenge = await generateCodeChallenge(codeVerifier);
            localStorage.setItem('code_verifier', codeVerifier);

            const checkAndSchedule = () => {
                if(!checkTokenValidity(localStorage.getItem('access_token')||'')) {
                    if(!(renewToken(localStorage.getItem('refresh_token')||''))) {
                        console.log('Failed to renew token, user needs to login again.');
                        logout();
                    } else {
                        console.log('Access token renewed successfully.');
                    }
                } else {
                    console.log('Access token is still valid.');
                }
                // schedule next check
                timer = setTimeout(checkAndSchedule, 5000);
            };

            // start loop
            timer = setTimeout(checkAndSchedule, 5000);
        })();

        // cleanup when component is destroyed
        return () => clearTimeout(timer);
    });
    let username: string = 'Guest';

    function login() {
        performLogin(codeChallenge);
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
    <div class="dropdown">
        <div tabindex="0" role="button" class="btn m-1 btn-square btn-ghost" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
        </div>
        <ul tabindex="-1" class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li><a href="/submit">Submission</a></li>
            <li><a href="/search">Search</a></li>
        </ul>
    </div>
    <a href="/" class="" aria-label="edal-logo">
        <img src={logo} class="select-none" alt="e!DAL Logo"/>
    </a>
  </div>
  <div class="navbar-center">
    <span class="text-lg font-semibold">e!DAL - Plant Genomics & Phenomics Research Data Repository</span>
  </div>
  <div class="navbar-end gap-2">
    {#if accesToken}
    <span>Hi, {username}</span>
    {/if}
    <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn m-1 btn-square btn-ghost" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-10 w-10 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
        </div>
        <ul tabindex="-1" class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            {#if accesToken}
            <li><a href="/profile">Profile</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><button onclick={logout} class="hover:bg-error hover:text-error-content">Logout</button></li>
            {:else}
            <li><button onclick={login}>Login</button></li>
            {/if}
        </ul>
    </div>
  </div>
</div>
<div>
    <img
        src={banner}
        alt="Header Banner"
        class="w-full h-8 object-cover bg-secondary border-b-4 border-t-4 border-double select-none"
    />
</div>