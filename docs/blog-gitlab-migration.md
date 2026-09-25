# 🚚 Migrating a self-managed GitLab to gitlab.com

> 💡 **TL;DR** — a GitLab migration is really **three independent migrations** — users,
> repositories and artifacts — each with its own tooling and its own failure modes. The
> transfers are API-driven and asynchronous, so "run it" is the easy half: the real work is
> **verifying every job actually finished**, re-checking the config that doesn't travel, and
> holding two coordination rules — a freeze period and an immediate origin switch — so no
> team writes into the dying instance.

## 1 · Three migrations, not one

The instinct is to treat "move to gitlab.com" as one project. It isn't. Users, repositories
and artifacts migrate through different mechanisms, fail differently, and can be scheduled
independently. Splitting them up front is what made the plan tractable — and what let us
verify each area on its own terms instead of declaring one big bang "done".

## 2 · Users

- **Account first.** Everyone needs an active gitlab.com account before anything moves.
- **Link it to SSO.** The account must be linked to the organization's SAML sign-on — we
  keep step-by-step instructions in the internal access manual, because a half-linked
  account is the most common source of "I can't see anything" tickets later.
- **Associate the old email.** Add the email address you used on the self-managed instance
  to the new gitlab.com profile. This is what lets the import map commits, MRs and comments
  back to *you* instead of to a ghost user.
- **Migrate via the API — then verify the job.** The user migration is an API call that
  triggers an **asynchronous job**, and the call succeeding does not mean the migration
  succeeded. Poll the job until it reaches a terminal state and check its result: partial
  imports, unmapped identities and rate-limit failures all surface *there*, not in the
  initial response. GitLab's documentation lists the error codes; we also wrapped the whole
  loop (trigger → poll → report) in a small migration script so nobody has to babysit it
  by hand.

## 3 · Repositories

- **Migrate groups, not repos.** Group-level (direct transfer) migration preserves the
  hierarchy, memberships and relative paths in one operation. One-by-one repo imports
  reconstruct structure by hand and always miss something.
- **Not all configuration travels.** Settings, CI/CD variables and protected-branch rules
  are only partially migrated — treat the import as *code + history*, and re-verify the
  configuration manually afterwards. We keep the platform's pipeline behavior in
  [reusable CI components](gitlab-components) precisely so a repo's config surface is
  small and declarative when a moment like this arrives.
- **Mind the size limit.** Repositories over **10 GB** can't be imported directly.
- **Clean before you move.** Pruning old pipeline history and large unused files on the
  *source* before the transfer avoids the most common import failures and cuts the
  migration time dramatically. The 10 GB cases above usually stop being 10 GB cases here.

## 4 · Artifacts

- **Package registries don't migrate natively.** GitLab's transfer tooling does not move
  npm, Maven or other package registries. We wrote a sync script that re-publishes certain
  registry artifact types into the new instance — it covers what we actually depend on,
  not every format, so inventory your registries early and decide what must survive versus
  what CI can simply rebuild.
- **Big pipeline history may truncate.** Moving the history of very large pipelines is
  where imports get slow or lossy. If an old run matters for compliance, export it;
  don't assume the import carries it.

## 5 · The coordination contract

The technical steps are scriptable. The failure mode is human:

1. **Freeze period.** From the moment a team's migration starts, the team **stops pushing
   and stops running jobs** against the old instance. Anything written after the transfer
   begins simply doesn't exist on the other side.
2. **Origin switch.** The moment the migration is confirmed, every clone repoints:
   `git remote set-url origin <new gitlab.com URL>`. Immediately — the old remote keeps
   accepting pushes into oblivion for anyone who forgets.

## 6 · What I'd tell you

Verify jobs, not calls — every transfer in this process is asynchronous, and the only
truth is the terminal job state. Budget as much time for the *re-checking* (settings,
variables, protected branches, registries) as for the transfer itself. And write the freeze
+ origin-switch rules down where every team sees them: the only data we nearly lost was
never in a failed job — it was in a push to the old remote.

## Related

[Reusable CI components](gitlab-components) · [A runner that can only touch its own tenant](blog-gitlab-runners) ·
[From on-premises to cloud](blog-migration-onprem-cloud) · [✍️ all articles](blog-index)
