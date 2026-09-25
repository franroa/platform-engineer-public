# 📦 Sandboxing Claude — three tools, three philosophies, and my setup

> 💡 **TL;DR** — "run the agent in a sandbox" hides a real design choice: isolate the
> **filesystem** ([Docker sandboxes](https://docs.docker.com/ai/sandboxes/agents/claude-code/)),
> policy-wrap the **process and its tools** ([nono](https://github.com/nolabs-ai/nono)), or
> free the hands and fence the **network** ([agent-cage](https://github.com/pnnl/agent-cage)).
> My daily setup is Docker sandboxes + [aoe profiles](blog-agent-of-empires) with pre-mounted
> folders and an **Obsidian vault as the sharing channel** — because a Docker sandbox's world
> is fixed at creation, and the vault is how context stays *dynamic* anyway.

## 1 · Three tools, three answers to "what do you distrust?"

- **Docker sandboxes (`sbx`)** — distrust the *runtime*. `sbx run claude ~/my-project` boots
  Claude Code inside a sandbox built from a template image, scoped to the project directory;
  user-level config from the host isn't visible, and multi-agent work comes back as git
  remotes (`git fetch sandbox-<name>`). The strongest containment of the three — the agent
  lives in another filesystem entirely.
- **nono** — distrust the *permissions*. No container, no daemon: JSON profiles declare
  filesystem scope, a network allowlist, credential rules — and, the clever part, the tools
  the agent shells out to (`git`, `gh`, `curl`, `kubectl`) each run in their own **child
  sandbox**, so the agent can't launder wider access through a subprocess. L7 filtering means
  the policy can say *which API methods*, not just which hosts.
- **agent-cage** — distrust the *exfiltration path*. A full-privilege Ubuntu container — the
  agent gets root, browser, everything — but all traffic passes a mitmproxy policy engine:
  TLS inspection, domain allowlists, method filtering, audit logs, a live dashboard.
  `pypi.org` allowed, anything else blocked and *recorded*. Freedom inside, customs at the
  border.

None of these is "the right one" — they answer different threat models, and they compose:
tight filesystem, tight tools, tight egress are three independent dials.

## 2 · The problem with static worlds

The catch with container-style sandboxes is that **the world is fixed at creation**. Mounts
are declared when the sandbox starts; you cannot dynamically hand the agent a folder, a
document or a config it wasn't born with. Mid-session, the conversation goes: *"look at this
doc" — "I can't see it" — destroy, remount, restart, context gone.* The isolation that
protects you is the same isolation that starves the agent.

## 3 · My setup: sandboxes + profiles + a vault as the context bus

The fix is to make the *mounts* static but the *content* dynamic:

- **Docker sandboxes** provide the containment tier ([trust is a dial](blog-agent-of-empires));
  the [🐳 badge in the statusline](blog-yas-wrapper) shows when a pane runs contained.
- **aoe profiles** define what each sandbox is born with: the profile's config directory
  mounted (so identity and skills work inside — solving the "no user-level config" gap),
  plus a small set of standing folder mounts per profile.
- **An Obsidian vault is one of those standing mounts — and it's the sharing channel.**
  Anything I want the agent to see mid-session, I drop into the vault; it appears instantly
  inside the sandbox because the *mount* already existed. Anything the agent produces —
  notes, findings, drafts — lands in the vault and is immediately readable (and linkable,
  and versionable) on the host. Same trick between two sandboxed agents: shared vault,
  shared context.

The vault isn't incidental — a folder of linked markdown is the ideal exchange format for
agents: plain text, diffable, no daemon, and the graph structure survives on both sides.
The sandbox stays sealed; the *content* flows through the one door built for it.

## 4 · What I'd tell someone sandboxing their agents

1. Name your threat model first — filesystem, permissions, or egress — and pick the tool
   that answers it; don't cargo-cult a container.
2. If you use container sandboxes, design the mounts *before* you need them: one config
   mount, one exchange mount. Remounting mid-session costs you the agent's context.
3. Make an exchange directory a standing convention — plain markdown, mounted everywhere,
   owned by you.
4. Surface containment in the UI ([the 🐳 badge](blog-yas-wrapper)) — a sandbox nobody can
   see is a sandbox someone will bypass.

## Related

[Agent of Empires](blog-agent-of-empires) · [A statusline that knows who's working](blog-yas-wrapper) ·
[A cockpit for a fleet of agents](blog-agent-cockpit) · [✍️ all articles](blog-index)
