import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'api.circle.com',
  'iris-api.circle.com',
  'iris-api-sandbox.circle.com',
]);

const FORWARD_HEADERS = ['content-type', 'x-user-agent', 'authorization'];

async function proxy(request: NextRequest): Promise<NextResponse> {
  const target = request.headers.get('x-proxy-target');

  if (!target) {
    return NextResponse.json({ error: 'Missing target.' }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Invalid target.' }, { status: 400 });
  }

  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
    return NextResponse.json({ error: 'Target not allowed.' }, { status: 403 });
  }

  const headers = new Headers();
  for (const name of FORWARD_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method;
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  try {
    const upstream = await fetch(url, { method, headers, body });
    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Upstream request failed.' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
