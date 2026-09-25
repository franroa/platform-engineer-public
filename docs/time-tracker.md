# time-tracker (`tt`) — ticket-aware time in the terminal

> A personal tool for working with this platform. Python (Typer), installed as an editable `uv` tool. *(My own tool — real.)*

`tt` is a lightweight, **tmux-native** time tracker. It records what you're working on as an append-only event log and, crucially, is **ticket-aware** — so at the end of the day the hours are already attributed to the right work.

## What it does

- **Start / stop / switch** what you're tracking, from the terminal — no context-switch to a GUI.
- **Ticket-aware.** When you're working on a ticket, `tt` associates the session with it, so time rolls up per ticket automatically.
- **Append-only log.** Events live in `events.jsonl` (+ a session/ticket map) under your local data dir — durable, greppable, yours.
- **tmux integration.** Hooks keep the current activity visible in the status line and re-register on a fresh server.
- **Feeds reporting.** The per-ticket totals feed the daily standup and the worklog step, so you log hours from *measured* time instead of guessing.

## How it fits the loop

`tt` is the timekeeping layer around the *dev-workflow*: pick a ticket → `tt` starts counting → you edit, run things locally with *gctui* and *tflocal*, push, open an MR → `tt` already knows how long each ticket took. See *dev-workflow*.

## Pseudocode: the day

```
tt start "P1234 — orders-service DB module"   # begins a ticket-tagged session
# … work: tflocal apply, gctui run, push, MR …
tt switch "P1240 — pipeline fix"              # closes prev, opens new session
tt stop                                       # end of day

# events.jsonl → per-ticket totals → daily standup + worklog (no guessing)
```

Kept as a real tool (like *gctui* and *tflocal*) because it's part of how this platform is actually worked with day-to-day.
