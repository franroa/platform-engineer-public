# Resources & Scopes — what lives where

Every resource exists at a **scope** — the thing it is created *once per*. Getting the scope right is most of the security model: it decides blast radius, who can touch it, and how many copies exist.

## The scope ladder

| Scope | Created once per… | Key resources | Owner |
|---|---|---|---|
| **Org / global** | the company (Nimbus) | DNS root, global config (`up-config`: org/network/subs YAML), RBAC + PIM foundation | Platform |
| **Subscription** | sector × tier (`ultracore-live`, `ultraapps-sandbox`, …) | subscription setup, baseline resource groups, budgets | Platform + Cloud |
| **Region** | region (`eu01`, `us01`) | hub VNet + spokes, DNS zones, NAT, flow logs, (eu01) VPN gateway; **AKS cluster** + node pools + platform services | Platform |
| **Tenant** | tenant (`up-tenants`) | AD groups + PIM (per tier), RBAC | Platform + Tenant |
| **Tenant × region** | tenant × region | **Key Vault** (⚠️ separate RG — see below), the tenant **resource group**, the tenant **namespace** on that region's cluster | Platform (isolation) + Tenant |
| **App** | app (`orders-service`) | app infra (via Terraform modules), Helm release (via charts), pipeline (via component), its secrets *inside* the tenant-region Key Vault | App / Tenant |

## ⚠️ Key Vaults are per **tenant-region**, in a **separate** resource group

A tenant does **not** get one Key Vault — it gets **one per region** (`kv-up-tenants-eu01`, `kv-up-tenants-us01`, …). And crucially, **the Key Vault does not live in the tenant's resource group.** It lives in a **separate, platform-owned resource group** dedicated to secrets.

```
resource group: rg-up-tenants-eu01        (TENANT-owned)
  ├─ app infra: databases, storage, …          ← tenant contributors manage these
  └─ (NO Key Vault here)

resource group: kv-up-tenants-eu01         (PLATFORM-owned, secrets only)
  └─ Key Vault kv-up-tenants-eu01           ← tenant gets "Secrets Officer" on the vault,
                                                   but NOT ownership of the RG
```

### Why split them out?

- **The tenant can *use* secrets, but can't destroy or re-permission the vault.** RBAC on the vault (data plane: read/write secrets) is separate from RBAC on its resource group (management plane: delete, change access policies). Keeping the vault in a platform-owned RG means a tenant `Contributor` on their own RG can't accidentally (or maliciously) delete the vault, wipe its access policies, or exfiltrate via management-plane operations.
- **Blast radius.** Tearing down or re-scoping the tenant's app RG never touches secret storage.
- **Per-region isolation.** A region's secrets stay in that region; a compromise or deletion in one region's vault doesn't reach another.
- **Auditability.** Secret stores are a small, uniform, platform-owned set of RGs that are easy to monitor and alert on.

## Reading it in 3D

The **Resources & Scopes** view lays these out as concentric scopes; the **Build an App** guided tour walks them top-down (Region → Cluster → Tenant → App). The Key Vault shows up at the **tenant-region** scope, deliberately drawn *outside* the tenant resource group.

## ✍️ Related writing

[Instrumentation as a platform default — the OpenTelemetry Operator](blog-otel-operator) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform) ·
[Well-architected is a set of questions, not a badge](blog-well-architected)
