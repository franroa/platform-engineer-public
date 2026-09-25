# 🏛️ Well-architected is a set of questions, not a badge

> 💡 **TL;DR** — the Well-Architected Framework's five pillars are usually answered with a
> slide. On this platform every pillar is answered with a **mechanism you can click**: the
> pillar question, the concrete design that answers it, and the map view where it lives. This
> post is the audit — pillar by pillar, against the running architecture.

## 1 · Reliability — can it fail without taking you with it?

The platform's reliability story is **rebuild-from-code, not backup-and-pray**. Every region
is the same cell stamped from the same Terraform: a hub VNet with role-per-file subnets and
spokes per sector × stage ([the hub-and-spoke deep dive](network-hub-spoke)). The honest part —
documented on the map, not hidden — is that the hub is a deliberate single point of failure:
one auditable chokepoint instead of a mesh of undocumented ones. Its mitigations are boring on
purpose: the hub holds no workload state, so it rebuilds from `up-network` fast; the one P2S
VPN gateway carries `lifecycle { prevent_destroy = true }` so no plan can delete it silently;
and an eight-tier deploy order makes the rebuild deterministic instead of archaeological.

Drift is treated as a reliability defect: the live engine diffs the real platform against the
declared mapping continuously, and unmapped repos or absent-but-expected pieces surface as a
⚠ badge — on the [globe](global-footprint), in the CLI, before they surface as an incident.

## 2 · Security — who can do what, and where is that written?

Security here is **three nested envelopes**, each one code:

- **Identity** — [nobody holds standing power](identity-pim): humans activate through PIM,
  operators are dedicated identities, tenant membership is a YAML merge request, and CI
  authenticates with secretless OIDC. Every role assignment lives in a repo the map names.
- **Network** — default-deny NSGs per subnet, one firewall per region with rule collections
  in code, [WAF](waf) at the edge, private endpoints for data services, flow logs shipped to
  Log Analytics. Spokes never peer with each other; every path crosses the inspected hub.
- **Policy** — an [OPA gate](security-opa) between `plan` and `apply`. Terraform that grants
  permissions or opens the network is *rejected*, not reviewed-and-sighed-at.

The sharpest security decision is placement, not encryption: each tenant's
[Key Vault lives in a platform-owned resource group](blog-tenant-keyvaults) — usable by the
tenant, indestructible by the tenant. A [403 is the fence doing its job](blog-tenant-isolation).

## 3 · Cost — does spending have an owner?

Cost control that survives contact with reality is **structural**, not dashboard-driven:
budgets are declared at subscription scope in `up-bootstrap` — the same
[scope](scopes) that owns the resources; egress is a shared NAT gateway per region instead of
per-workload public IPs; compute is dedicated [node pools](res-node-pools) sized per class of
workload rather than one oversized default; and observability tenancy labels double as the
cost model — [the bill arrives pre-attributed](blog-grafana-cloud) per tenant.

## 4 · Operational excellence — is the right way the easy way?

The paved road is [three files, not a wiki page](blog-golden-path): a new service composes a
CI component, Terraform modules and a Helm chart — and the [reuse grammar](reuse) is identical
across all three libraries. The deploy component enforces the same ceremony everywhere:
plan → human-readable plan summary → gated apply. Pipelines run
[locally byte-identical to remote](blog-local-remote-ci) before they're pushed. And the
platform documents itself: this map is generated from the same repositories it describes, so
the documentation cannot silently rot — drift shows up as drift.

## 5 · Performance efficiency — is capacity a decision or an accident?

Workloads land on **dedicated node pools with Guaranteed QoS** instead of competing in a
shared pool; each region gets its own hub, resolver and egress so no traffic crosses an ocean
to reach a firewall; and scaling is delegated to purpose-built operators from the
[landscape](landscape-index) — KEDA scales on events, Karpenter provisions nodes against
actual pod demand rather than a guessed VM count.

## 6 · The point

None of the above is a certification. It's five questions, each answered with a mechanism
that has a repo, a file, and a diagram — which is what "well-architected" has to mean if it
means anything: **when someone asks the pillar question, you point at code, not at a deck.**
Walk the pillars yourself: [the whole model](overview) · [scopes](scopes) ·
[network](network-hub-spoke) · [identity](identity-pim) · [policy](security-opa).

## Related

[The whole model — overview](overview) · [Scopes](scopes) ·
[Hub-and-spoke deep dive](network-hub-spoke) · [Identity & PIM](identity-pim) ·
[The OPA policy gate](security-opa) · [Tenant Key Vaults](blog-tenant-keyvaults) ·
[The golden path](blog-golden-path) · [✍️ all articles](blog-index)
