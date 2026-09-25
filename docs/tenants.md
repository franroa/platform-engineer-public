# Tenants — multi-tenant isolation

> Repos: `up-tenants`, `up-identity`, `up-gitlab-tenants`, `up-grafana-tenants`, `up-namespaces`, `up-multitenant`

A **tenant** is a team or product that gets its own slice of the platform: Azure AD groups, resource groups, Key Vaults, RBAC, Kubernetes namespaces and (where relevant) its own GitLab and Grafana projections. Tenancy is how the platform serves many teams from **one** set of shared infrastructure without letting them into each other's blast radius.

## What each tenant receives

```
{tenant}-live-admins         # Owner (PIM activation required)
{tenant}-live-contributors   # Contributor (PIM activation required)
{tenant}-live-operators      # automation only — permanent, no humans
{tenant}-sandbox-*           # same shape, sandbox tier
{tenant}-readers             # cross-tier read-only
```

Plus, provisioned by Terraform: resource group(s), RBAC assignments, and namespace(s) on the shared AKS clusters — **per region**.

### Key Vaults: per tenant-region, in a *separate* resource group

Secrets get special treatment. A tenant receives **one Key Vault per region** (`kv-{tenant}-{region}`), and each vault lives in a **separate, platform-owned resource group** — **not** the tenant's own resource group. The tenant gets *Key Vault Secrets Officer* (data-plane: read/write secrets) but **not** ownership of the vault's RG (management-plane: delete, change access policies). So a tenant can *use* secrets but can't destroy or re-permission the vault. See *Resources & Scopes* for the full rationale (blast radius, per-region isolation, auditability).

## Why model tenancy this way?

- **Same security grammar as the platform team.** Tenants inherit the identical PIM + operator + reader model (see *Identity & PIM*). One model to learn, audit and reason about.
- **Least privilege, per tenant.** Admins can manage their own resources and secrets but can't touch subscription-level settings or other tenants. Readers get visibility with no write path.
- **Shared cost, isolated risk.** Tenants share clusters, networks and observability, but namespaces + RBAC + separate Key Vaults keep them isolated. Multi-tenant efficiency without multi-tenant leakage.
- **Access as data.** Membership lives in YAML (`up-identity`) and becomes a merge request — reviewable and auditable, never a portal click.

## Pseudocode: provision a tenant

```
for tier in [sandbox, live]:
    groups   = create_pim_groups(tenant, tier)      # admins/contributors/operators
    rg       = create_resource_group(tenant, tier)
    kv       = create_key_vault(rg); grant(groups.contributors, "Secrets Officer", kv)
    ns       = create_namespace(cluster[tier], tenant)
    bind_rbac(groups, rg, ns)
readers = create_group(tenant + "-readers")          # permanent, cross-tier read
```

The output is a self-contained, least-privilege environment a team can own end-to-end.

## Identity before workloads — the onboarding state

A tenant exists as **identity and permissions first**; namespaces arrive later. The moment
`up-tenants/config/{tenant}.yml` and the GitLab group merge, the tenant is *real* — it has
owners, members, PIM groups and RBAC — even before it has shipped a single workload. Its
first namespace lands afterwards, through the [golden path](blog-golden-path), as a reviewed
merge request in `up-namespaces`.

That's why the roster can show a tenant with **zero namespaces**: `acme-retail` is exactly
this state — freshly onboarded, groups and access provisioned, no workloads yet. It isn't a
gap in the model; it's the model's first step made visible. Getting identity right up front
is what lets the workloads that follow inherit the guardrails instead of becoming exceptions.

## ✍️ Related writing

[Nobody holds standing power](blog-access-as-code) ·
[CAP is a decision you already made — here's where](blog-cap-theorem) ·
[A runner that can only touch its own tenant](blog-gitlab-runners) ·
[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[A 403 is usually the fence doing its job](blog-tenant-isolation) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults)
