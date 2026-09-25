# 🔐 Key Vault

> 💡 **TL;DR** — one Key Vault **per tenant × region**, living in a **separate,
> platform-owned resource group** — the tenant *uses* its vault but cannot delete or
> reconfigure it. Secrets reach pods via external-secrets; humans rarely touch them.

| Property | Value |
| --- | --- |
| **Scope** | tenant×region — deliberately **not** in the tenant's RG |
| **Created by** | `up-modules` (vault module) via tenant provisioning |
| **Access** | RBAC-mode, role assignments in code · private endpoint only |

## 🧠 The concept
A vault is only as good as its blast-radius design. Two decisions matter more than any
feature: **who can administer it** (vs merely read secrets) and **where it lives**. Putting a
tenant's vault *inside* the tenant's RG hands every RG contributor implicit power over it —
so ours live in a separate platform RG: usage is granted (data-plane roles), administration
stays with the platform.

## 🏗️ How it's used in this platform
- Provisioned per tenant×region by the tenant machinery (`up-tenants` → modules).
- **RBAC authorization** (not access policies): grants are `azurerm_role_assignment`s in
  code — the live security inventory lists every one of them.
- Reachable only via [private endpoint](res-private-endpoint.md); public access disabled.
- Pods consume secrets through **external-secrets** with workload identity — no secret
  values in git, CI variables, or manifests.

## ✅ Best practices we apply
- Data-plane roles (`Secrets User`) for consumers; admin roles only for the platform.
- Soft-delete + purge protection on — a deleted vault is recoverable, never silently gone.
- Diagnostics to [Log Analytics](res-log-analytics.md): every secret read is an audit event.

## ⚠️ Gotchas
- RBAC-mode and access-policy-mode are mutually exclusive — mixed tutorials cause confusion.
- Purge protection means a *name* stays reserved after delete until the retention passes.
- Throttling is per-vault — a secrets-hammering app can starve its neighbours in the same vault
  (another reason for per-tenant vaults).

## 🔗 Related
[Resource Group](res-resource-group.md) · [Private Endpoint](res-private-endpoint.md) ·
[tenants](tenants.md) · [identity-pim](identity-pim.md)

---
**Repo (map alias):** `up-modules` (module) · provisioning: `up-tenants`.

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[A SAS token is a one-year password you forgot you minted](blog-storage-proxy) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform) ·
[Twelve-Factor isn't a checklist — it's what the platform makes free](blog-twelve-factor)
