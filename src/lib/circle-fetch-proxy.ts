const CIRCLE_HOSTS = [
  'api.circle.com',
  'iris-api.circle.com',
  'iris-api-sandbox.circle.com',
];

let installed = false;

export function installCircleFetchProxy() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      return originalFetch(input, init);
    }

    if (!CIRCLE_HOSTS.includes(parsed.hostname)) {
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
