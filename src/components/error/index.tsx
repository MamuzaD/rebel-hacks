function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || String(error)
  if (error instanceof Response) {
    const { status, statusText, url } = error
    const parts = [`${status} ${statusText}`]
    if (url) parts.push(url)
    return parts.join(' — ')
  }
  return String(error)
}

function getErrorStack(
  error: unknown,
  info?: { componentStack: string },
): string | null {
  if (error instanceof Error && error.stack) return error.stack
  return info?.componentStack ?? null
}

export function RootError({
  error,
  info,
  reset,
}: {
  error: unknown
  info?: { componentStack: string }
  reset?: () => void
}) {
  const message = getErrorMessage(error)
  const stack = getErrorStack(error, info)
  const isResponse = error instanceof Response

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Something went wrong
        </h2>
        <p className="mt-2 font-mono text-sm text-foreground wrap-break-word">
          {message}
        </p>
        {isResponse && (
          <p className="mt-1 text-xs text-muted-foreground">
            A fetch/Response was thrown (e.g. failed request or redirect). Check
            network or server.
          </p>
        )}
        {stack && (
          <pre className="mt-4 overflow-auto rounded bg-muted/50 p-4 text-xs text-muted-foreground whitespace-pre-wrap">
            {stack}
          </pre>
        )}
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
