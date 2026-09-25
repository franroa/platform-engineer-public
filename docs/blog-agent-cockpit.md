# 🎛️ A cockpit for a fleet of agents

> 💡 **TL;DR** — when several AI agents work in parallel, the scarce resource isn't compute,
> it's *your* attention and navigation. My cockpit is tmux: a **which-key leader** (`prefix-A`)
> with five agent modes, and **agentsview** — a context inspector that reads each Claude
> session's transcript to show context fill, health and activity without interrupting anyone.
> Neovim and the Claude config are part of the same system: everything is a versioned dotfile,
> built and reloaded like code.

## 1 · Menus you can read, not chords you memorise

Tmux keybindings stop scaling around the third plugin. So the bindings are a **which-key
tree**: press the prefix and a discoverable menu appears — every key labelled, grouped, and
generated from a single `config.yaml` (a build step compiles it to tmux bindings; the config
is the source of truth, the bindings are artifacts). One table is the point of this article:
**`prefix-A`, the agent leader**, with five modes — *swarm* (spawn parallel agents on a
ticket), *review* (MR review popup), *pipeline* (assemble/run CI), *monitor* (watch what's
running), *workflow* (the meta-tools). Working with a fleet becomes: press `A`, read, pick.

## 2 · agentsview — state without interruption

The hard part of parallel agents is knowing **who needs you**. Asking an agent "how full is
your context?" costs a turn and interrupts the work. agentsview reads what's already on disk —
each session's **transcript JSONL** — and computes context fill, last activity and health
*from the outside*. A `K` menu opens single-view panes (context, logs, todos, memory, activity)
plus **fzf navigators** in vi mode: all sessions, health grouped by grade, per-project stats.
Inside the session navigator, one key attaches you to that agent's tmux session — from
"something's yellow" to "I'm in the pane" in two keystrokes.

The design rule behind it: **observe agents like you observe services.** You don't ssh into a
pod and ask it how it feels; you read its telemetry. Same here.

## 3 · The editor and the agent share one config system

Neovim, tmux, fish, the Claude setup — hooks, statusline, keybindings, skills — are all
**chezmoi-managed dotfiles**. Editing the live file is the classic trap (the next `apply`
reverts it); the loop is: edit the *source*, apply, reload. That discipline sounds bureaucratic
until the day a laptop dies — the whole cockpit, agent config included, reassembles from the
repo. Agent tooling is infrastructure now; it deserves infrastructure habits
([dev workflow](dev-workflow)).

## 4 · What I'd tell someone building theirs

1. Make bindings discoverable (menus) before making them fast (chords) — you'll re-learn your
   own setup monthly otherwise.
2. Read agent state from artifacts (transcripts, files), never by prompting — observation must
   be free.
3. Give the "attach to the thing that needs me" path a two-keystroke budget.
4. Version the whole cockpit; a config you can't rebuild is a config you'll fear changing.

## Related

[Attention is the bottleneck](blog-claude-signals) ·
[Agent of Empires](blog-agent-of-empires) · [Dev workflow](dev-workflow) ·
[Neovim & the River toolchain](neovim-tools) · [✍️ all articles](blog-index)
