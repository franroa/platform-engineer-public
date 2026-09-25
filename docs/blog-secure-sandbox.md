# 🔒 What a secure agent sandbox should look like

> 💡 **TL;DR** — I run my agents under [Agent of Empires](blog-agent-of-empires), and I audited
> its Docker sandbox the way I'd audit platform infrastructure. The result was **four issues I
> filed upstream** ([#2704](https://github.com/agent-of-empires/agent-of-empires/issues/2704) ·
> [#2705](https://github.com/agent-of-empires/agent-of-empires/issues/2705) ·
> [#2706](https://github.com/agent-of-empires/agent-of-empires/issues/2706) ·
> [#2707](https://github.com/agent-of-empires/agent-of-empires/issues/2707)) — and together
> they sketch the answer to a general question: a secure agent sandbox needs **least
> capability, least network, validated trust boundaries, and ephemeral credentials.** Any
> containerised agent runner can be measured against those four.

## 1 · Least capability (#2704)

"It runs in a container" is not a security statement — a default Docker container keeps a
surprising set of kernel capabilities and can gain privileges through setuid binaries. The
sandbox should let you run the agent with **`--cap-drop ALL`** and
**`--security-opt no-new-privileges`**, and today there's no way to add either. My proposal
in [#2704](https://github.com/agent-of-empires/agent-of-empires/issues/2704): make hardening
flags **first-class settings**, and add a generic `sandbox.extra_run_args` escape hatch so
future flags don't need a release. The design lesson generalises: security options must be
*reachable* — a sandbox whose runtime flags are hardcoded is exactly as secure as its
maintainer's last threat model.

## 2 · Least network (#2705)

An agent that only needs the mounted workspace doesn't need a network; an agent that needs
its API endpoint doesn't need *your LAN*. [#2705](https://github.com/agent-of-empires/agent-of-empires/issues/2705)
proposes `sandbox.network = "none"` or a **named network** per sandbox, defaulting to the
current bridge behaviour so nothing breaks. Egress is the exfiltration path — the
[agent-cage philosophy](blog-sandboxing-claude) — and it deserves a dial, not a constant.
Named networks also unlock the good pattern: a sandbox that can reach *one proxy* which
enforces the actual policy.

## 3 · Validated trust boundaries (#2706) — the one that bites

The sharpest of the four: `extra_volumes` accepts **any mount source without validation** —
`$HOME`, `~/.ssh`, `/var/run/docker.sock`. Mounting the Docker socket into a sandbox isn't a
sandbox anymore; it's a container escape with extra steps. And the trust-boundary angle makes
it a supply-chain issue, not a footgun: **repo-level config can contribute mounts** — so a
repository you *clone* can ask for the socket. Config that travels with the repo is data
from the internet; the moment it can influence mounts, mount sources need an allow/deny
policy and sensitive paths need to fail loudly. This is the same rule the platform applies
everywhere: [inputs crossing a trust boundary get validated](blog-tenant-keyvaults), no
matter how convenient they are.

## 4 · Ephemeral credentials (#2707)

Whatever leaks *into* a sandbox will eventually leak *out of* it — so the credentials inside
should be worthless within the hour. [#2707](https://github.com/agent-of-empires/agent-of-empires/issues/2707)
proposes injecting **short-lived cloud credentials** — AWS STS session tokens, Azure
federated/`export-credentials` tokens — instead of copying long-lived keys into the
container. It's the same move as the platform's [secretless OIDC CI](blog-access-as-code):
don't guard the secret harder, make the secret *expire*. An agent sandbox holding a
long-lived cloud key is a time bomb with a filesystem.

## 5 · The checklist

Four issues, one shape. A secure agent sandbox:

1. **Drops what it doesn't need** — capabilities, privilege escalation paths (#2704).
2. **Reaches only what it must** — network as a per-sandbox dial (#2705).
3. **Validates what crosses the boundary** — mounts are policy, repo config is untrusted (#2706).
4. **Holds nothing worth stealing** — credentials that expire before they matter (#2707).

None of this is specific to one tool — it's the platform-engineering playbook
([least privilege](blog-access-as-code), [blast radius](blog-tenant-keyvaults), policy gates)
applied to the newest workload we run: each other's agents. Filing it upstream is the point —
[the paved road](blog-golden-path) only exists if someone builds the guardrails in.

## Related

[Sandboxing Claude](blog-sandboxing-claude) · [Agent of Empires](blog-agent-of-empires) ·
[Nobody holds standing power](blog-access-as-code) · [✍️ all articles](blog-index)
