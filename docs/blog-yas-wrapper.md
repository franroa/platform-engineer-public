# 📟 A statusline that knows who's working — yas, wrapped

> 💡 **TL;DR** — my Claude statusline is **yet-another-statusline (yas)**, deliberately
> *untouched*, plus a small wrapper that runs yas's own `main()`, captures the rendered line,
> and **splices four badges into it**: 📄 context files (`src/total`), 🧠 memory files loaded,
> the **profile identity** (🌳 personal / 🧑‍💻 work), and 🐳 when the agent runs inside a
> sandbox container. Extension by composition, not by fork — the upstream updates freely, my
> badges survive.

## 1 · Wrap, don't fork

The tempting move when a tool almost fits is forking it; the fork then rots. The wrapper
pattern keeps yas pristine: it imports and executes the real statusline, intercepts the output
string, and splices badges next to the model/effort cluster. yas upgrades cleanly under it —
the same reason platform code consumes [versioned modules](blog-reuse-libraries) instead of
copying them. The wrapper is ~one file of Python; the leverage is in what the badges *say*.

## 2 · Four badges, four questions answered at a glance

- **📄 `12/18` — what has the agent actually read?** Distinct files pulled into context this
  session, shown as `source/total`: files under the project's working roots (widened to their
  git repos) versus everything, including reads outside any root. A `3/19` says the agent is
  wandering; a `14/16` says it's grounded in the codebase.
- **🧠 `4` — how much standing instruction is loaded?** Memory and `CLAUDE.md` files
  auto-loaded into context, counted separately so they never inflate the 📄 figure.
- **🌳 / 🧑‍💻 — *who* is this agent?** I run personal and work Claude accounts side by side
  ([Agent of Empires](blog-agent-of-empires)); the badge shows which profile owns the pane.
  The wrapper resolves it from the session manager's own state — mapping the live session id
  to the profile that registered it — because identity read from authoritative state can't
  drift from reality. Same rule as the platform: [identity is explicit and visible](blog-access-as-code).
- **🐳 — where is it running?** Shown only inside a sandbox container. Low-trust work is
  visibly contained; the badge's *absence* certifies a host session.

## 3 · Why the statusline is the right place

All four answers exist elsewhere — buried in config files, `docker inspect`, transcripts. The
statusline is where they become **ambient**: always rendered, in the pane, at the moment of
action. Combined with the [blink-on-done hooks](blog-claude-signals) and
[agentsview](blog-agent-cockpit), the terminal answers the three governance questions
continuously: *what is the agent doing, as whom, and inside what?* — without asking it
anything.

## 4 · What I'd tell someone extending their tools

1. Wrap upstream tools; never fork for cosmetics. Run their entrypoint, post-process the output.
2. Surface *identity* and *containment* — the two facts you most regret not noticing.
3. Derive badges from authoritative state (session registries, container runtime), not from
   environment variables someone forgot to set.
4. Count what the agent reads. Context composition is the best cheap proxy for whether it's
   working on your code or hallucinating around it.

## Related

[A cockpit for a fleet of agents](blog-agent-cockpit) ·
[Attention is the bottleneck](blog-claude-signals) ·
[Agent of Empires](blog-agent-of-empires) · [✍️ all articles](blog-index)
