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
