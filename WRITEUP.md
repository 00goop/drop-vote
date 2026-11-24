# Drop Vote — Submission Note

**What I built:** Drop Vote is a live polling app. You sign in, ask a question with 2–4 options and share the link. Everyone who opens it sees the tallies update in real time as people vote. Each person gets one vote and can change it until the poll's creator closes it.

**DeepSpace integrations used, and why**
- **Auth (Google OAuth/JWT):** One vote per person only means something if you know who each voter is. Anonymous visitors can still browse and watch results.
- **Records + realtime sync:** This is the core of the app. `useQuery` subscriptions push every vote to all viewers, so I didn't write any websocket or polling code.
- **RBAC + schema constraints:** `userBound` voter/owner ids, `uniqueOn [pollId, voterId]` and `'own'` update rules mean the server rejects double votes, spoofed votes and edits to other people's polls, even if someone bypasses the UI.

**Left out, and why**
- **AI chat/RAG:** It doesn't help someone make a quick decision with a group.
- **Payments:** Nothing here is sold.
- **File storage/images:** Image options would be nice for comparing designs, but they add an upload flow I couldn't finish and test properly in the time I had.
- **Presence/cursors:** Showing who's looking at a poll is a nice extra, but live vote counts already show the room is active.
- **Cron/background jobs:** Nothing runs on a schedule. Polls are closed by hand.

**Main tradeoff:** I chose depth on one path over breadth. Create → share → vote → see live results is fully enforced on the server and tested, and images, comments and expiring polls were cut. I also kept polls public-read so a shared link works for anyone. The cost is that there are no private polls.

**What the agent did:** Claude read the DeepSpace skill and the SDK's type definitions. It scaffolded the app and wrote the schema, the pages, the validation/tally helpers with their unit tests, and drafts of this README and note.

**What I verified or changed myself:** See `LOG.md`. I checked every agent change, deployed it, and tested the main path on the live URL in an incognito window and on my phone with two accounts (voting, changing a vote, double-vote attempts, closing a poll). The two-account test caught a real bug the agent's code missed: the client sent empty `voterId`/`ownerId` fields, which the server correctly rejected for regular members. It had passed for me only because I'm the app owner, which makes me an admin. I removed those fields from the client and let the server stamp them. I also tried empty and duplicate options and a bad poll link, and checked the repo and git history for secrets.

**Unfinished / next:** a closed poll blocks voting in the UI, but the server doesn't yet reject votes on closed polls (needs a server action check); image options, poll expiry (a cron job), private or invite-only polls, presence ("5 watching"), a two-user Playwright test with `deepspace/testing`, and paging past the latest 50 polls.
