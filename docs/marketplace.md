# 🛍️ fran-local-synapse — the skills marketplace

> A personal tool for working with AI assistants. A **local plugin marketplace**: every
> skill, agent, command and hook I use lives in one versioned repo, packaged as plugins
> an assistant can install — instead of loose files scattered across machines and tools.

The [AI layer](ai-ultraplatform) has one core idea: **team knowledge as artifacts** — "how
we do X" written down so an assistant can execute it consistently. The marketplace is the
delivery half of that idea, applied personally: artifacts are only useful if the session
you're in *has* them, at the *right version*.

## What it is

A git repo that is itself a **plugin marketplace** (`fran-local-synapse`): a manifest
listing plugins, each plugin a folder bundling related artifacts —

- **`git`** — git workflow safety and automation.
- **`productivity`** — standup generation, activity summaries, calendar/ticket glue.
- **`workflow`** — engineering-workflow skills (tickets, MRs, reviews).
- **`platform`** + **tenant tooling** — skills for operating the platform's repos: routing
  permission changes to the right identity repo, provisioning tenant runners, debugging
  platform issues.
- **`portfolio`** — the skills that maintain this very site and map
  ([improve-platform-map](about), write-post, content-sync). Their source of truth lives in
  the map's own repo and is **symlinked** into the plugin — one copy, no drift.

## Why a marketplace and not a dotfiles folder

- **Versioning** — each plugin declares a version; an upgrade is a diff, a regression is a
  revert. Skills stop being "whatever was on that laptop".
- **Scoping** — a session installs the plugins it needs (`/plugin` → marketplace →
  install), not everything; work skills stay out of personal sessions and vice versa.
- **Tool-agnostic by construction** — the artifacts are plain markdown + scripts; the same
  repo serves Claude Code today and whatever assistant comes next
  (the [AI layer](ai-ultraplatform)'s portability rule, applied to my own tooling).
- **The platform reuse story, personally** — the same discipline the platform applies to
  [Terraform modules and CI components](reuse): write once, version it, consume everywhere.

## The loop

```
edit skill in its home repo  →  plugin symlinks it  →  bump plugin version
→  commit the marketplace    →  every session installs/updates from one place
```

## 🔗 Related
[AI · the intelligence layer](ai-ultraplatform) · [Reuse & golden paths](reuse) ·
[gctui](gctui) · [The dev workflow](dev-workflow)

## ✍️ Related writing

[A marketplace of one — versioning your own AI skills](blog-marketplace)
