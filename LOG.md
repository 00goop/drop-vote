# Build Log — agent vs. me

| Step | Agent (Claude) did | I verified / changed |
|---|---|---|
| Setup | Read DeepSpace skill + SDK `.d.ts`; found the first deploy permanently locks source to GitHub or DeepSpace, so GitHub remote must be added first | Ran `auth login`, created the GitHub repo, first deploy |
| Schema | Wrote `polls`/`votes` with `userBound` ids, `uniqueOn`, `'own'` RBAC | |
| Logic | `src/lib/polls.ts` + 9 unit tests (validation, parsing, tally) — all pass | |
| UI | Home (create + list), poll page (vote, live tallies, share, close) | |
| Checks | `tsc` clean, eslint clean | |
| Live test | — | |
| Secrets | — | `git log -p \| grep -i -E "key\|token\|secret"`; no `.env` tracked |
