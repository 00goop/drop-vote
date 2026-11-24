# Build Log — agent vs. me

| Step | Agent (Claude) did | I verified / changed |
|---|---|---|
| Setup | Read DeepSpace skill + SDK `.d.ts`; found the first deploy permanently locks source to GitHub or DeepSpace, so GitHub remote must be added first | Ran `auth login`, created the GitHub repo, first deploy |
| Schema | Wrote `polls`/`votes` with `userBound` ids, `uniqueOn`, `'own'` RBAC | |
| Logic | `src/lib/polls.ts` + 9 unit tests (validation, parsing, tally) — all pass | |
| UI | Home (create + list), poll page (vote, live tallies, share, close) | |
| Checks | `tsc` clean (also on my machine), eslint clean | |
| Live test | Ran on drop-vote.app.space in Chrome: signed-out browse + empty state, `/poll/abc` → "Poll not found", empty form and duplicate options rejected, created a 3-option poll, voted, changed vote (total stayed 1), second tab updated live without refresh, closed poll → other tab showed Closed live and options disabled | Signed in myself; reviewed results; phone test with a second account |
| Secrets | — | `git log -p \| grep -i -E "key\|token\|secret"`; no `.env` tracked |
| Bug fix | Removed client-sent `voterId`/`ownerId` from create calls | Found it: phone test with a 2nd account got "Role 'member' cannot modify field 'voterId'" — my own account passed only because the app owner is admin |
