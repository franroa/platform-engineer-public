# 🏰 Agent of Empires — sessions, worktrees, profiles, sandboxes

> 💡 **TL;DR** — running many agents safely needs the same disciplines as running many
> workloads: **isolation, identity and lifecycle**. Agent of Empires (aoe) is my tmux-based
> session manager where each unit of work is a *session*, each session can own a **git
> worktree** (parallel work, no branch contention), each session runs under a **profile**
> (separate credentials/config per context), and riskier work drops into a **sandbox**. It's
> a tiny scheduler for agents, with tenancy ideas borrowed from platform engineering.

## 1 · The session is the unit of work

`aoe add <repo> -w <branch> -b --base-branch <base> -l` — one command creates a branch, a
worktree, a tmux session wired to it, and launches the agent inside. When the work merges,
`aoe remove --delete-worktree --delete-branch` tears the whole thing down. The session *is*
the ticket: it has a name, a workspace, a lifecycle, and nothing survives it. That
create/destroy symmetry is the difference between "parallel agents" and "seventeen abandoned
checkouts."

Not everything deserves that ceremony, though — so there are also **scratchpads**: instant,
nameless sessions for the "quick question, quick experiment" tier of work. A scratchpad skips
the branch/worktree ritual entirely, which is exactly the point: making the lightweight path
*explicit* keeps the heavyweight path honest. If a scratchpad starts turning into real work,
it graduates to a proper session — with a ticket, a worktree and a lifecycle — instead of
real work quietly accumulating inside something disposable.

## 2 · Worktrees: parallelism without contention

Three agents on one clone will trip over each other's branches and dirty trees. Git worktrees
give each session its **own working directory on its own branch** from one repository — the
classic *isolate the blast radius* move. The practical lesson learned the annoying way:
gitignored local config (`.env`, ports, credentials files) is **not** copied into a new
worktree — the session setup has to carry it over, or the first `docker compose` in the new
tree connects to the wrong database and you debug a ghost.

## 3 · Profiles: identity per context

I run **two Claude accounts side by side** — personal and work — and an agent must never be
confused about which one it is. Each aoe profile declares its environment (its own config
directory, credentials, history); sessions inherit the profile they were created under, and a
statusline badge shows which identity a pane is running as. It's the platform's
[identity rule](blog-access-as-code) in miniature: **the executing identity is explicit,
scoped, and visible** — never ambient. Shared, non-secret config (skills, hooks, statusline)
stays symlinked to one canonical location so both profiles evolve together; only credentials
and history are isolated.

## 4 · Sandboxes: trust is a dial, not a default

Some sessions are exploratory — an agent poking at an unfamiliar codebase or running
generated scripts. Those run in **sandbox mode**: an isolated filesystem view where the
profile's config is mounted read-only and the blast radius is the sandbox, not the laptop.
The mental model is tiers, exactly like platform environments: normal host sessions for
trusted, reviewed work; sandboxes for anything whose behaviour I can't predict. Moving
between them is a flag, so safety doesn't cost setup time.

## 5 · What I'd tell someone building one

1. Tie workspace lifecycle to session lifecycle — orphaned worktrees are the new dangling VMs
   (aoe ships a `worktree cleanup` for a reason).
2. Make identity visible in the UI. An agent on the wrong account is a leak, not an oops.
3. Copy local config into new worktrees explicitly; implicit is how ghosts are born.
4. Keep shared config canonical + symlinked, credentials isolated — the same split as any
   multi-tenant system.

## Related

[A cockpit for a fleet of agents](blog-agent-cockpit) ·
[Nobody holds standing power](blog-access-as-code) ·
[Dev workflow](dev-workflow) · [✍️ all articles](blog-index)
