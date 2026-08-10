export type LogLevel = 'info' | 'warn' | 'error';

function toSerializable(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === 'bigint') return value.toString();

  if (Array.isArray(value)) return value.map(toSerializable);

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toSerializable(v);
    }
    return out;
  }

  return value;
}

export function maskWalletAddress(address?: string | null): string | undefined {
  if (!address) return undefined;
  const trimmed = address.trim();
  if (trimmed.length < 10) return '***';
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

export function logEvent(level: LogLevel, event: string, context: Record<string, unknown> = {}): void {
  const serializedContext = toSerializable(context);
  const contextObject =
    serializedContext && typeof serializedContext === 'object' && !Array.isArray(serializedContext)
      ? (serializedContext as Record<string, unknown>)
      : {};

  const payload = {
    level,
    event,
    ts: new Date().toISOString(),
    ...contextObject,
  };

  const line = JSON.stringify(payload);

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, context?: Record<string, unknown>): void {
  logEvent('info', event, context);
}

export function logWarn(event: string, context?: Record<string, unknown>): void {
  logEvent('warn', event, context);
}

export function logException(event: string, error: unknown, context?: Record<string, unknown>): void {
  logEvent('error', event, {
    ...context,
    error,
  });
}
