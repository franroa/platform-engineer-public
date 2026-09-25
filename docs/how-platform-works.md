# 🏗️ How the platform works — the build order

> 💡 **TL;DR** — the platform is not installed, it is **derived**: a chain of Terraform
> repos, each consuming the previous layer's remote state and publishing its own. Start
> from an empty cloud account, run the layers in order, and you get the whole thing —
> identity, network, clusters, runners, tenants. This guide walks the chain in creation
> order, then the day-2 guides (create a tenant, add a runner).

## 0 · `up-bootstrap` — the cloud account itself

The only layer that assumes nothing. It owns account-level concerns everything else
depends on:

- **RBAC & identities** — admin groups, PIM policies, and the **platform operator managed
  identities** (per sector × tier) that every CI pipeline below authenticates as — no
  stored secrets, federated credentials only.
- **Resource groups** — one per (sector, tier), the containers later layers deploy into.
- **Audit** — PIM-activation alerts + the audit Log Analytics workspace.

*Publishes:* operator identity IDs + resource-group names, consumed by nearly every layer
below ([identity & PIM](identity-pim)).

## 1 · `up-config` — the single source of truth

Pure configuration, no infrastructure: three YAMLs at the repo root —

- `org.yml` — sectors, tiers, regions, region groups.
- `network.yml` — hub/spoke CIDRs, VPN regions, management CIDRs.
- `subscriptions.yml` — cloud subscription IDs per (sector, tier).

Terraform decodes them and republishes everything as **remote-state outputs**. Every other
module reads its facts (region maps, CIDRs, subscription IDs) from here — never hardcoded.
Changing the platform's shape starts with an MR to a YAML in this repo.

## 2 · `up-identity` — who exists

Azure AD groups from YAML: per-tenant and per-environment group definitions with
memberships, deployed by CI. Access is a reviewable diff, nobody clicks in a portal
([identity & PIM](identity-pim)).

## 3 · `up-network` — the hub-and-spoke fabric

Per region: the **hub** VNet (shared infrastructure), the **spoke** VNets (sector × tier),
peering, DNS, NAT, flow logs — and in eu01 the **P2S VPN gateway**, the one operator door.
CIDRs come from `up-config`'s `network.yml`. Full story:
[hub-and-spoke deep dive](network-hub-spoke) · [the VPN](vpn).

## 4 · `up-guardrails` — the rules of the game

Cloud policies (audit + deny + DINE) and the [OPA plan-time gate](security-opa) that every
Terraform pipeline below must pass. Deployed before workloads exist, so nothing ever runs
ungoverned.

## 5 · `up-kubernetes` — the clusters

Three modules, run **in order**: `cluster` → `nodes` → `services`. The services module
seeds [Argo CD](landscape-argocd), and from that point on GitOps owns the cluster —
platform services (ingress, cert-manager, policy engines, observability agents) sync from
the repo's `gitops/` tree by waves ([Kubernetes / AKS](kubernetes)).

## 6 · `up-gitlab` — CI as code

The GitLab account itself, as Terraform: group settings, and the **runner fleet** on the
clusters. Runners authenticate with **workload identity** — they consume the operator
identities `up-bootstrap` created via remote state; no registration tokens in variables
([GitLab runners](gitlab-runners)).

## 7 · Tenants — `up-tenants` + `up-gitlab-tenants`

The onboarding layer (see the guide below). After this, application teams exist.

## 8 · The operational layers

- **`up-observability`** — dashboards, alerts, log routing ([observability](observability)).
- **`up-backups`** — criticality-routed vaults + DR pairs ([backup vaults](res-backup-vault)).
- **`ai/` tiers** — foundry → gateway → subscriptions ([the AI layer](ai-ultraplatform)).

---

## 📗 Guide · create a tenant

1. **`up-tenants`** — add the tenant's YAML entry. One MR creates the whole security
   model: AD groups (`{tenant}-{tier}-admins/-contributors/-readers`, admins PIM-gated),
   the tenant resource groups, the per-tenant-region **Key Vault** (platform-owned RG —
   deliberately not the tenant RG), RBAC, and Kubernetes access ([tenants](tenants)).
2. **`up-gitlab-tenants`** — add the tenant's GitLab entry: its group, owner memberships,
   and a **tenant runner** with workload identity bound to its own operator identity.
3. **`up-namespaces`** — declare the tenant's namespaces (one YAML file each; cluster,
   region, quotas). Argo CD creates them on the next sync.
4. Permissions beyond the defaults go through `up-identity` (extended groups).

## 📗 Guide · add a GitLab runner

Platform runners live in `up-gitlab` (`runners/`); tenant runners in `up-gitlab-tenants`.
Either way it is one Terraform entry: the runner pod's ServiceAccount federates to a
managed identity — **no registration token is ever stored**. Tag it, MR it, the pipeline
rolls it out ([GitLab runners](gitlab-runners)).

## 📗 Guide · add a region

`up-config` first (`org.yml` + `network.yml` + `subscriptions.yml`), then re-run the
layers that are per-region: network → kubernetes → gitlab runners → observability →
backups. The region joins the hub-and-spoke and appears on
[the globe](global-footprint) on the next sync.

## Related

[Overview — the whole model](overview) · [Identity & PIM](identity-pim) ·
[Hub-and-spoke network](network-hub-spoke) · [Kubernetes](kubernetes) ·
[GitLab runners](gitlab-runners) · [Tenants & isolation](tenants) ·
[Backup vaults](res-backup-vault) · [Build an app (the app team's view)](build-an-app)
