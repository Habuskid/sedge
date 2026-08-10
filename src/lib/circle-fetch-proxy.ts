const PROXY_HOSTS = [
  // Keep proxying only authenticated Circle API requests.
  // Do NOT proxy Iris attestation hosts used by App Kit bridge flow.
  'api.circle.com',
];

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
