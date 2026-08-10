import { logException } from './logger';

type ExceptionReporter = (error: unknown, context?: Record<string, unknown>) => void | Promise<void>;

let exceptionReporter: ExceptionReporter | null = null;

/**
 * Register a production error reporter (e.g. Sentry).
 *
 * Example integration point:
 * setExceptionReporter((error, context) => Sentry.captureException(error, { extra: context }))
 */
export function setExceptionReporter(reporter: ExceptionReporter): void {
  exceptionReporter = reporter;
}

export async function reportException(error: unknown, context: Record<string, unknown> = {}): Promise<void> {
  if (!exceptionReporter) return;
  try {
    await exceptionReporter(error, context);
  } catch (reporterError) {
    logException('observability.reporter_failed', reporterError, { originalContext: context });
  }
}
