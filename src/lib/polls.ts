/** Pure helpers for polls — no React, so they're easy to unit test. */

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 4
export const MAX_TITLE = 120
export const MAX_OPTION = 60

/** Parse the stored JSON options column; bad data yields an empty list. */
export function parseOptions(raw: unknown): string[] {
  if (typeof raw !== 'string') return Array.isArray(raw) ? raw.map(String) : []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/** Validate a new poll. Returns an error message, or null if it's valid. */
export function validatePoll(title: string, options: string[]): string | null {
  const t = title.trim()
  const opts = options.map((o) => o.trim()).filter(Boolean)
  if (!t) return 'Give the poll a question.'
  if (t.length > MAX_TITLE) return `Question must be ${MAX_TITLE} characters or less.`
  if (opts.length < MIN_OPTIONS) return `Add at least ${MIN_OPTIONS} options.`
  if (opts.length > MAX_OPTIONS) return `Use at most ${MAX_OPTIONS} options.`
  if (opts.some((o) => o.length > MAX_OPTION)) return `Options must be ${MAX_OPTION} characters or less.`
  if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) return 'Options must be different.'
  return null
}

/** Count votes per option. Out-of-range indexes are ignored. */
export function tally(optionCount: number, votes: { optionIndex: number }[]): number[] {
  const counts = new Array<number>(optionCount).fill(0)
  for (const v of votes) {
    if (Number.isInteger(v.optionIndex) && v.optionIndex >= 0 && v.optionIndex < optionCount) {
      counts[v.optionIndex] += 1
    }
  }
  return counts
}
