/**
 * Home — create a poll and see every poll, newest first.
 * Anyone can browse; creating requires sign-in.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthOverlay, useAuth, useMutations, useQuery } from 'deepspace'
import { Button, EmptyState, Input, useToast } from '@/components/ui'
import { MAX_OPTION, MAX_OPTIONS, MAX_TITLE, MIN_OPTIONS, parseOptions, validatePoll } from '@/lib/polls'
import type { Poll } from '@/schemas/polls-schema'

export default function HomePage() {
  const { records, status } = useQuery<Poll>('polls', { orderBy: 'createdAt', orderDir: 'desc', limit: 50 })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Drop Vote</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask a question, share the link, watch the votes land live.
        </p>
      </header>

      <CreatePoll />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent polls</h2>
        {status === 'loading' && <p className="text-sm text-muted-foreground">Loading…</p>}
        {status === 'error' && <p className="text-sm text-destructive">Couldn't load polls. Refresh to retry.</p>}
        {status === 'ready' && records.length === 0 && (
          <EmptyState title="No polls yet" description="Create the first one above." />
        )}
        {records.map((r) => (
          <Link
            key={r.recordId}
            to={`/poll/${r.recordId}`}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
          >
            <span className="font-medium">{r.data.title}</span>
            <span className="text-xs text-muted-foreground">
              {r.data.closed ? 'Closed' : `${parseOptions(r.data.options).length} options`}
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}

function CreatePoll() {
  const { isSignedIn } = useAuth()
  const { ready, createConfirmed } = useMutations<Poll>('polls')
  const { error: toastError } = useToast()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">Sign in to create a poll and vote.</p>
        <Button className="mt-3" onClick={() => setShowAuth(true)}>Sign in</Button>
        {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  const setOption = (i: number, value: string) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? value : o)))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const problem = validatePoll(title, options)
    setFormError(problem)
    if (problem) return
    setSubmitting(true)
    try {
      // ownerId is omitted: the server stamps it from the signed-in user (userBound).
      const id = await createConfirmed({
        title: title.trim(),
        options: JSON.stringify(options.map((o) => o.trim()).filter(Boolean)),
        closed: 0,
      } as Poll)
      navigate(`/poll/${id}`)
    } catch (err) {
      toastError('Could not create poll', err instanceof Error ? err.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <Input
        aria-label="Question"
        placeholder="What should we drop next?"
        value={title}
        maxLength={MAX_TITLE}
        onChange={(e) => setTitle(e.target.value)}
      />
      {options.map((o, i) => (
        <div key={i} className="flex gap-2">
          <Input
            aria-label={`Option ${i + 1}`}
            placeholder={`Option ${i + 1}`}
            value={o}
            maxLength={MAX_OPTION}
            onChange={(e) => setOption(i, e.target.value)}
          />
          {options.length > MIN_OPTIONS && (
            <Button
              type="button"
              variant="ghost"
              aria-label={`Remove option ${i + 1}`}
              onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
            >
              ✕
            </Button>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={options.length >= MAX_OPTIONS}
          onClick={() => setOptions((prev) => [...prev, ''])}
        >
          + Option
        </Button>
        <Button type="submit" disabled={!ready || submitting}>
          {submitting ? 'Creating…' : 'Create poll'}
        </Button>
      </div>
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
    </form>
  )
}
