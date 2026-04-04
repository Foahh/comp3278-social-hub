const ISO_TIMEZONE_SUFFIX_RE = /(Z|[+-]\d{2}:\d{2})$/i

export function parseApiDate(value: string): Date {
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value

  // Backend currently returns MySQL DATETIME-style strings without timezone info.
  // Treat those timestamps as UTC so "time ago" labels are stable across clients.
  if (!ISO_TIMEZONE_SUFFIX_RE.test(normalized)) {
    return new Date(`${normalized}Z`)
  }

  return new Date(normalized)
}
