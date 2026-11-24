# Drop Vote

Live polls on DeepSpace. Create a question with 2–4 options, share the link, and everyone in the room sees votes land in real time. One vote per person, changeable until the creator closes the poll.

**Live:** https://drop-vote.app.space

## Run

Requires Node 22.15+ / 24 and **npm 11.6+**.

```sh
npm install
npx deepspace auth login
npx deepspace dev start      # local dev
npx vitest run src/lib       # unit tests for validation + tallying
npx deepspace deploy         # ships to <app>.app.space
```

No secrets are needed. If one is ever added, it goes in `npx deepspace secrets`, never in the repo.

## Structure

| Path | What it is |
|---|---|
| `src/schemas/polls-schema.ts` | `polls` and `votes` collections: columns, RBAC, one-vote-per-user constraint |
| `src/lib/polls.ts` | Pure logic: validation, option parsing, tallying (unit tested) |
| `src/pages/(app)/home.tsx` | Create-poll form + live list of recent polls |
| `src/pages/(app)/poll/[id].tsx` | Poll page: vote, live tallies, share link, close/reopen |
| `src/pages/index.tsx` | Static landing page |
| `worker.ts` | DeepSpace scaffold worker (unchanged) |

## How it works

- **Realtime:** `useQuery` is a live subscription to the app's RecordRoom, so tallies update for every viewer without polling or custom websockets.
- **Integrity is enforced on the server, not the UI:** `voterId` and `ownerId` are `userBound` (stamped from the verified JWT), `votes` has `uniqueOn: ['pollId', 'voterId']`, and update/delete is `'own'`. Signed-out visitors are read-only.
