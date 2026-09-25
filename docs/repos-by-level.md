# Repos by level

Which repository owns which layer of the platform — so you know **where to change what**.
Everything is Terraform/Helm/CI-as-code; a change lands as a merge request in the repo that
owns that scope. Names below are the map's aliases (the real repos are internal).

> Rule of thumb: **infra = the platform repo for that scope**, **reusable logic = a library**
> (modules / charts / CI components), **an app only composes** — it never copies platform code.

## Governance envelopes

| Level | Repo(s) | You change here… |
| --- | --- | --- |
| Identity & Access | `up-identity` (identities) · `up-bootstrap` (bootstrap RBAC/PIM) | AD groups, PIM roles, operator identities |
| Network perimeter | `up-network` (network/core) · `up-vpn` (VPN) | hub/spoke VNets, peering, DNS/NAT, the P2S VPN gateway |
| Security & OPA | `up-policies` (policy) · `up-security-policies` (security policy) · `up-guardrails` (guardrails) · `up-ci-toolkit` (`policies/terraform/`) | OPA/rego rules, Azure Policy, GitLab security policies |
| WAF | `up-waf` | WAF policies on the Application Gateway (AGfC) |

## Delivery spine (bottom → top)

| Level | Repo(s) | You change here… |
| --- | --- | --- |
| Config | `up-config` | shared config, environment inputs |
| Network | `up-network` | the hub-and-spoke topology & subnets |
| VPN | `up-vpn` | the single Point-to-Site door (Entra ID) |
| Kubernetes | `up-kubernetes` (cluster) · `up-nodepools` (node pools) · `up-namespaces` (namespaces) · `up-crds` (CRDs) | AKS cluster, node pools, cluster services, namespaces |
| GitLab / Runners | `up-gitlab` | CI engine, runners, OIDC |
| Tenants | `up-tenants` (tenant infra) · `up-multitenant` (SaaS multi-tenant) | a tenant's RG, RBAC, namespace, Key Vault/Storage/DB |
| AI | `ultraplatform-ai` · `up-agents` (agents) | the AI artifact layer |
| Observability | `up-observability` · `up-grafana` | Grafana/Mimir/Loki as code, dashboards |

## Scope columns (the "Resources & Scopes" view)

| Scope | Owns | Repo(s) |
| --- | --- | --- |
| **Region** (subscription) | VNets, DNS/NAT, VPN gateway, Log Analytics | `up-network`, `up-vpn`, `up-observability` |
| **Cluster** (AKS) | control plane, node pools, ALB/WAF, cert-manager, ACR | `up-kubernetes`, `up-nodepools`, `up-waf` |
| **Tenant** | AD groups, RBAC, namespace, tenant RG | `up-tenants`, `up-namespaces` |
| **Tenant × Region** | Key Vault, Storage, PostgreSQL (separate platform RG) | `up-tenants` + `up-modules` |
| **App** (workload) | Service, HTTPRoute, Helm release | `up-helm-charts` (charts) + `up-ci-components` (pipeline) + the app's own repo |

## Reusable libraries (nothing is written twice)

- **GitLab CI components** — `up-ci-components` (included in `.gitlab-ci.yml`).
- **Terraform modules** — `up-modules` (reused via `module { source = …?ref=v… }`).
- **Helm charts** — `up-helm-charts` (reused as `Chart.yaml` dependencies).
- **OPA/rego policies** — `up-ci-toolkit/policies/terraform/` + per-repo `opa/terraform.rego`.

## "Where do I change permissions for…?"

- **A person's access / PIM role** → `up-identity` (+ `up-bootstrap` for the RBAC baseline).
- **A tenant's members/owners** → `up-tenants` (the tenant's `config/<tenant>.yml`).
- **What a pipeline is allowed to do (OIDC/CI)** → `up-gitlab` + the OPA gate in `up-ci-toolkit`.
- **Network reachability (who can reach what)** → `up-network` (peering/NSGs) · `up-vpn` (VPN).
- **WAF allow/deny** → `up-waf`.

> Prefer the **Ask** panel (bottom-left) for "in which repo do I change X" — it routes the question
> against this map and, when the local GitLab backend is connected, runs a real code search too.

## ✍️ Related writing

[Three libraries, one platform](blog-reuse-libraries) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform)
