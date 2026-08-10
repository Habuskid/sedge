const PROXY_HOSTS = [
  // Keep proxying only authenticated Circle API requests.
  // Do NOT proxy Iris attestation hosts used by App Kit bridge flow.
  'api.circle.com',
];

const IRIS_ATTESTATION_HOSTS = new Set([
  'iris-api.circle.com',
  'iris-api-sandbox.circle.com',
]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let installed = false;

export function installCircleFetchProxy() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const originalFetch = globalThis.fetch;
  const appOrigin = window.location.origin;

  globalThis.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    let parsed: URL | null = null;
    try {
      parsed = new URL(url, appOrigin);
    } catch {
      return originalFetch(input, init);
    }

    // Never proxy first-party API calls; they must preserve app auth/session cookies.
    if (parsed.origin === appOrigin && parsed.pathname.startsWith('/api/')) {
      return originalFetch(input, init);
    }

    // App Kit attestation polling can return transient 404 until Circle indexes
    // the burn message. Retry a few times with backoff before bubbling failure.
    const method = (init?.method || (typeof input === 'object' && input && 'method' in input ? (input as Request).method : 'GET')).toUpperCase();
    const isAttestationLookup =
      method === 'GET' &&
      IRIS_ATTESTATION_HOSTS.has(parsed.hostname) &&
      parsed.pathname.startsWith('/v2/messages/');

    if (isAttestationLookup) {
      // CCTP attestation lookups can remain 404 for a while after burn.
      // Poll longer before giving up.
      const maxAttempts = 20;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await originalFetch(input, init);
        if (response.status !== 404 || attempt === maxAttempts) {
          return response;
        }

        const delayMs = Math.min(2000 + attempt * 500, 8000);
        console.warn(`[CCTP] Attestation not ready yet (404). Attempt ${attempt}/${maxAttempts}. Retrying in ${delayMs}ms.`);
        await sleep(delayMs);
      }
    }

    if (!PROXY_HOSTS.includes(parsed.hostname)) {
      return originalFetch(input, init);
    }

    const proxyHeaders = new Headers(init?.headers);
    proxyHeaders.set('x-proxy-target', url);

    return originalFetch('/api/circle-proxy', {
      ...init,
      headers: proxyHeaders,
    });
  };
}
