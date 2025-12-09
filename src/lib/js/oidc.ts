import generalConfig from '$lib/config/general.json';
import { replaceState } from '$app/navigation';

export async function retrieveOidcConfig() {
    const response = await fetch(generalConfig.aai['openid-configuration']);
    return await response.json();
}

export function generateCodeVerifier() {
    let codeVerifier = btoa(
        String.fromCharCode.apply(
            null,
            Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))
        )
    );
    codeVerifier = codeVerifier.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return codeVerifier;
}

/**
 * @param {string} codeVerifier
 */
export async function generateCodeChallenge(codeVerifier: string) {
    // ASCII codeverifier
    const ascii = new TextEncoder().encode(codeVerifier);
    // Hash codeverifier
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', ascii);
    // Convert hash to base64url
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = hashArray.map((b) => String.fromCharCode(b)).join('');
    const hashBase64Url = btoa(hashBase64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return hashBase64Url;
}

export function checkTokenValidity(token: string) {
    if (!token) {
        return false;
    }
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
        return false;
    }
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    if (!payload.exp) {
        return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime < payload.exp;
}

export async function retrieveToken(code: string) {
    let oidcConfig = await retrieveOidcConfig();
    let codeVerifier = localStorage.getItem('code_verifier') || '';
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
    localStorage.setItem('access_token', tokenResponse.access_token);
    localStorage.setItem('refresh_token', tokenResponse.refresh_token);
    replaceState(window.location.pathname, {});
}

export async function renewToken(refreshToken: string) {
    let oidcConfig = await retrieveOidcConfig();
    let data = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: generalConfig.aai['client-id']
    }

    let response = await fetch(oidcConfig.token_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data).toString()
    });
    
    let tokenResponse = await response.json();
    localStorage.setItem('access_token', tokenResponse.access_token);
    localStorage.setItem('refresh_token', tokenResponse.refresh_token);
}

export async function performLogin(codeChallenge: string) {
    let oidcConfig = await retrieveOidcConfig();
    let clientId = generalConfig.aai['client-id'];

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