# 🛍️ A marketplace of one — versioning your own AI skills

> 💡 **TL;DR** — the skills you write for an AI assistant are software: they drift, they
> break, they get silently forked across machines. I moved every skill, agent, command and
> hook I own into a single **local plugin marketplace** ([fran-local-synapse](marketplace)) —
> versioned plugins, one source of truth, installed per session. A marketplace with exactly
> one customer is still worth running, because the customer is future-you.

## 1 · The dotfiles trap, again

Assistant skills start life the way shell aliases did: a file here, a snippet there, a
copy on the work laptop that's three edits ahead of the copy at home. Then a session picks
up the stale one, executes yesterday's process with today's confidence, and you spend an
evening wondering why the "same" skill behaves differently in two terminals.

The failure isn't the skill — it's the **distribution**. Knowledge-as-artifacts (the whole
premise of [the AI layer](ai-ultraplatform)) only works if the artifact a session loads is
the artifact you meant.

## 2 · Plugins, because scope matters

A marketplace forces two decisions dotfiles never ask for:

- **Grouping.** Artifacts ship as plugins with a domain: `git` (workflow safety),
  `productivity` (standups, summaries), `workflow` (tickets, MRs), platform tooling
  (tenant provisioning, permission routing), `portfolio` (the skills that maintain this
  site and its 3D map). A session installs what it needs — work skills stay out of
  personal contexts, and vice versa.
- **Versioning.** Each plugin declares a version. Upgrading is a diff you can read;
  a regression is a revert. "Which version of the skill did that session run?" has an
  answer.

## 3 · Symlinks keep one source of truth

The portfolio plugin doesn't *contain* its skills — it **symlinks** them from the repo
where they're authored and tested. The marketplace is a distribution surface, not a second
home; there is exactly one editable copy of every artifact, and the plugin picks it up the
moment it changes. Bump the version, commit, and every machine that installs from the
marketplace is current.

That's the platform's [reuse discipline](reuse) — modules, charts and CI components,
written once and consumed by reference — applied to something as small as my own prompts.
The size of the artifact doesn't change the economics of the copy-paste fork.

## 4 · Why bother, for one person

Because "one person" is the wrong count. The real consumers are *every future session on
every machine*, each starting cold and trusting whatever artifacts it finds. Versioned,
scoped, single-sourced distribution is what makes those sessions consistent — and it's
what turns a personal bag of tricks into something a team could adopt by changing exactly
one thing: the number of people with push access.

## Related

[fran-local-synapse — the skills marketplace](marketplace) ·
[AI · the intelligence layer](ai-ultraplatform) · [Reuse & golden paths](reuse)
