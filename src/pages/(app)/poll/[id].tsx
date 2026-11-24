/**
 * Poll page — the core path. Live tallies update for everyone in the room as
 * votes come in (useQuery is a realtime subscription). Signed-in users get one
 * vote each and can change it until the creator closes the poll.
 */

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthOverlay, useAuth, useMutations, useQuery } from 'deepspace'
import { Button, EmptyState, useToast } from '@/components/ui'
import { cn } from '@/lib/utils'
import { parseOptions, tally } from '@/lib/polls'
import type { Poll, Vote } from '@/schemas/polls-schema'

export default function PollPage() {
  const { id = '' } = useParams()
  const { userId, isSignedIn } = useAuth()
  const { records: polls, status } = useQuery<Poll>('polls', { where: { recordId: id }, limit: 1 })
  const { records: votes } = useQuery<Vote>('votes', { where: { pollId: id } })
  const voteMut = useMutations<Vote>('votes')
  const pollMut = useMutations<Poll>('polls')
  const { success, error: toastError } = useToast()
  const [showAuth, setShowAuth] = useState(false)

  const poll = polls[0]
  if (status === 'loading') return <p className="p-8 text-sm text-muted-foreground">Loading…</p>
  if (!poll) {
    return (
      <div className="p-8">
        <EmptyState
          title="Poll not found"
          description="It may have been deleted, or the link is wrong."
        />
        <div className="mt-4 text-center">
          <Link to="/home" className="text-sm underline">Back to polls</Link>
        </div>
      </div>
    )
  }

  const options = parseOptions(poll.data.options)
  const counts = tally(options.length, votes.map((v) => v.data))
  const total = counts.reduce((a, b) => a + b, 0)
  const myVote = votes.find((v) => v.data.voterId === userId)
  const isOwner = !!userId && poll.data.ownerId === userId
  const closed = !!poll.data.closed

  async function vote(optionIndex: number) {
    if (!isSignedIn) return setShowAuth(true)
    if (closed || myVote?.data.optionIndex === optionIndex) return
    try {
      if (myVote) await voteMut.putConfirmed(myVote.recordId, { optionIndex })
      // voterId is omitted: the server stamps it from the signed-in user (userBound).
      else await voteMut.createConfirmed({ pollId: id, optionIndex } as Vote)
    } catch (err) {
      toastError('Vote not saved', err instanceof Error ? err.message : undefined)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      success('Link copied')
    } catch {
      toastError('Copy failed', window.location.href)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <Link to="/home" className="text-sm text-muted-foreground hover:underline">← All polls</Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{poll.data.title}</h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'vote' : 'votes'} · {closed ? 'Closed' : 'Live'}
          {myVote && !closed && ' · tap another option to change your vote'}
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {options.map((label, i) => {
          const pct = total ? Math.round((counts[i] / total) * 100) : 0
          const mine = myVote?.data.optionIndex === i
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => vote(i)}
                disabled={closed || (isSignedIn && !voteMut.ready)}
                aria-pressed={mine}
                className={cn(
                  'relative w-full overflow-hidden rounded-lg border px-4 py-3 text-left transition-colors',
                  mine ? 'border-primary' : 'border-border hover:bg-accent',
                  closed && 'cursor-default',
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-primary/15 transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative flex items-center justify-between gap-3">
                  <span className="font-medium">{mine ? '✓ ' : ''}{label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {counts[i]} · {pct}%
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copyLink}>Copy share link</Button>
        {isOwner && (
          <Button
            variant="secondary"
            disabled={!pollMut.ready}
            onClick={() => pollMut.put(poll.recordId, { closed: closed ? 0 : 1 })}
          >
            {closed ? 'Reopen poll' : 'Close poll'}
          </Button>
        )}
        {!isSignedIn && <Button onClick={() => setShowAuth(true)}>Sign in to vote</Button>}
      </div>

      {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
    </div>
  )
}
