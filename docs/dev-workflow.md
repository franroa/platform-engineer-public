# Dev Workflow — how the platform is actually worked with

The reusable libraries only pay off if the **feedback loop is fast and local**. That loop is built from three custom tools — **`gctui`**, **`tflocal`** and **`tt` (time-tracker)** — plus GitLab MRs.

## The loop

```
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. tt start "P1234 …"      → begin a ticket-tagged session   │
  │ 2. edit an app/module/pipeline (reusing the platform libs)  │
  │ 3. tflocal  → run the reusable Terraform MODULE locally      │
  │              (writes *_override.tf, apply, then cleans up)   │
  │ 4. gctui    → run the reusable PIPELINE locally              │
  │              (assemble → gitlab-ci-local → diff vs remote)   │
  │        ↺ repeat 2–4 until green locally                      │
  │ 5. push → open a Merge Request (component/module/chart pins) │
  │ 6. remote pipeline: plan → OPA gate → apply                  │
  │ 7. tt stop  → hours already attributed to the ticket        │
  └─────────────────────────────────────────────────────────────┘
```

## Why local-first

- **Same steps as remote.** `gctui` runs the *actual* GitLab components locally (via `gitlab-ci-local`) and **diffs** local vs remote, so "works on my machine" is provable, not hoped.
- **No secrets, no drift.** `tflocal` re-points a real module at local-friendly values with throwaway `*_override.tf` overrides, then deletes them — the tracked files never change.
- **Fidelity is the rule.** Divergence from remote must be *auditable* (gctui's `D` diff), and overrides are kept minimal on purpose.

## Why measure it

`tt` wraps the loop so effort is attributed to the right ticket automatically — the same reuse discipline (don't do it twice, make it auditable) applied to your own time.

## The tools

- **[gctui](gctui.md)** — local GitLab-CI cockpit (assemble, run, diff).
- **[tflocal](tflocal.md)** — local-only Terraform overrides.
- **[time-tracker](time-tracker.md)** — ticket-aware time in tmux.

Together they make consuming the reusable **components + modules + charts** (see *Reuse* and the *Example App*) a tight, trustworthy loop.

## ✍️ Related writing

[A cockpit for a fleet of agents](blog-agent-cockpit) ·
[Agent of Empires — sessions, worktrees, profiles, sandboxes](blog-agent-of-empires) ·
[Attention is the bottleneck — signals from a working agent](blog-claude-signals) ·
[The golden path is three files, not a wiki page](blog-golden-path) ·
[Run the pipeline before you push it](blog-local-remote-ci)
