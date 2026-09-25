# 🔔 Attention is the bottleneck — signals from a working agent

> 💡 **TL;DR** — an agent that needs a human and can't say so is a stalled agent. My Claude
> sessions signal their state through **tmux itself**: lifecycle hooks write a per-session
> status file, the statusline **spins while the agent works, blinks when it's done or needs
> input**, and two background pollers fold **GitLab events** (CI results, MR comments,
> mentions) into the same strip. I look at one line to know if anyone — agent or reviewer —
> is waiting on me.

## 1 · The problem: polling your own agents

Run three agents in parallel and the naive workflow is checking each pane in a loop — which
is exactly the busy-waiting we'd never accept from software. The fix is the same as in
distributed systems: **push, don't poll**. The agent should emit events; the environment
should render them where your eyes already are.

## 2 · Hooks → status file → statusline

Claude Code exposes lifecycle hooks (work started, work finished, input needed). Mine are
three tiny shell scripts that write a **status file per tmux session** — that's the whole
event bus. The tmux statusline reads it and renders: a **spinner** while the agent is
working, a **blink** when it finished or is blocked on a question. The blink is the
important one — "done" and "needs you" are the two states worth stealing attention for, and
they're visible from across the room, in whatever window I'm in.

Two design choices worth copying:

- **Files as the bus.** No daemon, no socket, no race — a hook writes a file, the statusline
  reads it. Every state survives a tmux restart because the file *is* the state.
- **Per-session granularity.** Each agent signals independently; with several sessions the
  statusline is a row of states, not one ambiguous light.

## 3 · The same strip carries GitLab

Agent states are half the picture; the other half is what the remote thinks of the work. Two
pollers (from [gctui](gctui), my CI cockpit) run as background services: one watches **CI
pipelines** for pushed branches, the other watches **MR comments, approvals and mentions**.
Both write durable state files — same pattern as the hooks — and surface as statusline
glyphs with unread counts. A failed remote pipeline and an agent asking a question look
adjacent, because to *my attention* they are the same thing: **a queue item**
([run the pipeline before you push it](blog-local-remote-ci) covers keeping that queue short).

## 4 · What I'd tell someone wiring this

1. Reserve interruption (blink, notification) for exactly two states: *finished* and
   *blocked*. Everything else is ambient.
2. Write state to files with stable paths; every consumer you'll want later (statusline,
   menus, scripts) can read a file.
3. Put remote events (CI, reviews) in the same visual channel as agent events — context
   switching between "agent dashboards" and "GitLab tabs" is where minutes die.
4. Make the signals survive restarts. A status that resets on reboot teaches you to distrust it.

## Related

[A cockpit for a fleet of agents](blog-agent-cockpit) ·
[Run the pipeline before you push it](blog-local-remote-ci) ·
[Dev workflow](dev-workflow) · [✍️ all articles](blog-index)
