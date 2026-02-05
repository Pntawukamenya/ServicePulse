/**
 * Log errors to terminal with route context
 */
export function logError(req: { method?: string; path?: string }, message: string, error?: unknown): void {
  const route = req?.method && req?.path ? `[${req.method} ${req.path}]` : '[API]';
  console.error(`${route} ERROR: ${message}`);
  if (error instanceof Error && error.stack) {
    console.error(`  ${error.stack}`);
  } else if (error) {
    console.error(`  ${String(error)}`);
  }
}
