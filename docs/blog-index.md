# ✍️ Writing — platform engineering, from practice

> 💡 **TL;DR** — long-form notes on how (and why) this platform is built: Terraform at
> organizational scale, multi-tenant Kubernetes, and an AI layer that actually knows the
> platform. Everything here links into the interactive map — click through and the 3D view
> follows you.

These articles are written from the same knowledge base that powers this map's resource notes
and its chat. They are opinionated, grounded in a real production platform (anonymized), and
each one links to the deep-dive notes so you can drill from essay → concept → resource.

## Articles

| Article | One-liner |
| --- | --- |
| [A marketplace of one — versioning your own AI skills](blog-marketplace) | Assistant skills drift and fork like dotfiles — a local plugin marketplace (versioned plugins, symlinked single source, per-session installs) makes every future session consistent. |
| [Disaster recovery is a rehearsal, not a binder](blog-disaster-recovery) | Region loss as a scheduled event: cross-region copies by design, a designated DR region pair, and a weekly restore drill that proves the backup can become a running system again. |
| [A backup is a tag, not a ticket](blog-backups) | One data_criticality tag routes every resource to the right vault pair — geo-replicated for critical, zonal for important — with enrolment enforced by policy, not requested by ticket. |
| [A raw model key is a budget with no owner and no off switch](blog-ai-gateway) | Model keys never leave the platform — a GenAI gateway gives every app its own key, a hard token budget and a usage trail, and clients only change base_url. |
| [Blender now takes a chat message as input, and that changes who can 3D-model](blog-blender-mcp) | An MCP server for Blender lets an assistant drive the modeling tool from plain language — prototyping gets faster, and the floor for who can start drops. |
| ["What happens when it dies?" is the whole architecture review](blog-failure-modes) | Delete a box from the diagram and read what's left — the answer is a design property or a war story, and war stories are findings. |
| [A good plan names the files before it touches them](blog-writing-plans) | A plan is the cheapest place to be wrong — name the exact files and edits, put the verification in the plan, and state what you won't do. |
| [The cheapest bug to kill is still in the plan](blog-reviewing-plans) | Review the approach, blast radius, missing states and escape hatch — then approve narrowly. Plan review beats diff review. |
| [A skill is a prompt you only write once](blog-writing-skills) | Encode your conventions once: one job, a description written to trigger it, the whole ceremony, and guardrails that bite. |
| [Review a skill by the mistakes it prevents](blog-reviewing-skills) | Taste-test, don't lint: does it trigger, do the steps survive a literal agent, do the guardrails actually stop the failure? |
| [DNS is the platform's phone book — and its weakest excuse for an outage](blog-dns) | Names as infrastructure: private zones, records generated from live ingresses, and TTLs chosen as a consistency knob. |
| [TLS is easy; rotating certificates without downtime is the real job](blog-tls-rotation) | Certificates are time bombs with friendly names — issue and renew with a controller, and make the rotation actually reach the pods. |
| [Load balancing — L4 moves connections, L7 makes decisions](blog-load-balancing) | "Load balancer" names two machines: L4 spreads connections by tuple, L7 routes on the request. Use each where it belongs. |
| [SLOs and error budgets — turning "is it up?" into a number you can spend](blog-slo-error-budgets) | An SLI measures what users feel, an SLO is the target, and the error budget is a currency you spend on releases. |
| [Blue-green and canary — ship to a few before you ship to everyone](blog-progressive-delivery) | Progressive delivery is traffic-splitting plus a health signal, with rollback as the feature, not the fallback. |
| [Defense in depth — no single wall, because walls fall](blog-defense-in-depth) | Stack independent envelopes — identity, network, policy — so getting through one buys an attacker almost nothing. |
| [Twelve-Factor isn't a checklist — it's what the platform makes free](blog-twelve-factor) | The platform enforces most of the twelve so the app team gets them for free: config from a vault, stateless pods, logs as streams, disposability by default. |
| [The OSI model, one layer at a time](blog-osi-model) | Seven layers as a map of where a decision belongs — L3/4 packets, L4 load balancing, L7 routing and policy, DNS underneath. The layer tells you which repo to open. |
| [You can't SSH into production — that's the feature](blog-immutability) | Every manual hot-fix is drift the code doesn't know about. Immutable infrastructure removes the temptation by removing the door: change the code, roll a new one. |
| [Replace, don't repair — cattle, not pets](blog-replace-dont-repair) | Repairing a live instance is bespoke and unrepeatable; replacing it from code is boring, automatic and identical every time — which is why the platform does it for you. |
| [Idempotency: declare the end state, run it twice](blog-idempotency) | The quiet property that makes a platform safe to automate — Terraform applies to the same result, Argo CD syncs on a loop, a failed pipeline is just re-run. |
| [CAP is a decision you already made — here's where](blog-cap-theorem) | CAP isn't a whiteboard abstraction — you make the call every time you decide where data lives. Regional-by-default placement, per tenant-region secrets. |
| [Terraform at scale — scopes, tiers and a policy gate](blog-terraform) | Why "one repo per concern, one scope per resource" beats a mono-state, and how an OPA gate makes `apply` boring. |
| [Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) | Namespaces as code, dedicated node pools, and why the tenant's Key Vault deliberately lives where the tenant can't delete it. |
| [An AI layer for a developer platform](blog-ai-platform) | Grounding assistants in the platform's own knowledge graph instead of hoping the model guesses right. |
| [Your secrets don't live in your resource group](blog-tenant-keyvaults) | One Key Vault per tenant per region, placed in a platform-owned resource group — usable by the tenant, indestructible by the tenant. |
| [A 403 is usually the fence doing its job](blog-tenant-isolation) | Tenants are isolated cells — near-admin inside, no power outside, no self-service in. A cross-tenant role-assignment 403 is the boundary made visible, not a missing permission. |
| [A runner that can only touch its own tenant](blog-gitlab-runners) | GitLab configured per tenant; env vars pin each runner to a managed identity that can assign permissions only in its own tenant. The config is the boundary — and the platform owns it. |
| [A SAS token is a one-year password you forgot you minted](blog-storage-proxy) | SAS tokens are long-lived, over-scoped bearer credentials you can't individually revoke. Clients get none — a storage proxy authenticates with a managed identity, scopes each request, and revokes in one place. |
| [Three libraries, one platform](blog-reuse-libraries) | Terraform modules, Helm charts and GitLab CI components — one reuse grammar, with the OPA policy pack riding inside. |
| [The golden path is three files, not a wiki page](blog-golden-path) | A new service composes a pipeline component, modules and charts — the paved road that's also the shortest route. |
| [Instrumentation as a platform default — the OTel Operator](blog-otel-operator) | A design note: collectors and auto-instrumentation as CRDs, so tenants inherit traces from their namespace. |
| [Nobody holds standing power](blog-access-as-code) | PIM-activated humans, standing operator identities, membership as YAML merge requests, secretless OIDC CI. |
| [Every alert email can prove where it came from](blog-azure-email) | One shared email relay, one sender identity per tool — and a DKIM check inside every message that proves its origin. |
| [A cockpit for a fleet of agents](blog-agent-cockpit) | A which-key agent leader in tmux and agentsview — observing agents from their transcripts, for free. |
| [Attention is the bottleneck](blog-claude-signals) | Hooks → status files → a statusline that spins while agents work and blinks when they need you; GitLab events in the same strip. |
| [Agent of Empires — sessions, worktrees, profiles, sandboxes](blog-agent-of-empires) | Tenancy ideas applied to agents: isolated workspaces, explicit identities, sandboxes for low-trust work. |
| [Run the pipeline before you push it](blog-local-remote-ci) | Local CI byte-identical to remote, every divergence auditable in a one-key diff, and the real pipeline watched after push. |
| [Skills are golden paths for agents](blog-agent-skills) | Versioned, reviewable procedures the agent loads on demand — the paved-road idea, applied to AI. |
| [A statusline that knows who's working](blog-yas-wrapper) | yas untouched + a wrapper splicing in context-file, memory, profile-identity and sandbox badges. |
| [fran-local-synapse — a marketplace for my agent's habits](blog-synapse-skills) | Personal skills as plugins in a local marketplace: ticket ceremonies, pipeline setup, CI watching, git guardrails. |
| [Sandboxing Claude — three tools, three philosophies](blog-sandboxing-claude) | Docker sandboxes vs nono vs agent-cage, and my setup: sandboxes + profile mounts + an Obsidian vault as the dynamic context bus. |
| [What a secure agent sandbox should look like](blog-secure-sandbox) | Four issues I filed upstream: least capability, least network, validated mounts, ephemeral credentials. |
| [Gathering and filtering information](blog-info-filtering) | An RSS list fetched by an agent that prioritizes and summarizes against an interest profile written as markdown. |
| [Grafana Cloud as the observability backend](blog-grafana-cloud) | Keep the opinionated half, outsource the 3 a.m. — and let tenancy labels be the cost model. |
| [Migrating observability: on-prem → Grafana Cloud](blog-grafana-cloud-migration) | Dual-write at the agents, migrate the readers, starve the old stack. |
| [From on-premises to cloud](blog-migration-onprem-cloud) | Migrate the operating model, not the servers: guardrails first, golden path as the migration. |
| [Moving a platform between Azure subscriptions](blog-migration-subscriptions) | Recreate the scope, repoint the pointers, dual-run until the diff is intentional. |
| [Migrating a self-managed GitLab to gitlab.com](blog-gitlab-migration) | Three independent migrations — users, repos, artifacts — verify jobs not calls, plus the freeze + origin-switch contract. |
| [Well-architected is a set of questions, not a badge](blog-well-architected) | The five pillars audited against the running platform — every pillar answered with a clickable mechanism, not a slide. |

## How to read this map like a blog

- Click any linked concept — it opens **in this panel**, Notion-style, and the 3D view flies to
  the matching diagram or pulses the matching resource.
- `Ctrl+K` searches every article, view, region and resource note.
- Every page has **Open raw .md** / **Copy for Notion** in the footer — the whole knowledge
  base is plain markdown, managed as a linked graph.

## Related

[📚 Library — the whole vault, by layer](library) · [The whole model — overview](overview) ·
[Hub-and-spoke deep dive](network-hub-spoke) · [The VPN, in detail](vpn) · [About](about)
