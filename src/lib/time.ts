/**
 * Simple relative time string (e.g. "2h ago") from a timestamp in ms.
 */
export function timeAgo(ms: number): string {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return `${Math.floor(day / 7)}w ago`
}

/** Format a timestamp as local time (e.g. "6:47 PM"). */
export function formatTimeLocal(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Relative time until a future timestamp (e.g. "in 2h", "in 34m"). */
export function timeUntil(endMs: number, now = Date.now()): string {
  const sec = Math.max(0, Math.floor((endMs - now) / 1000))
  if (sec < 60) return 'soon'
  const min = Math.floor(sec / 60)
  if (min < 60) return `in ${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `in ${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `in ${day}d`
  return `in ${Math.floor(day / 7)}w`
}
