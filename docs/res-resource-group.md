# 📁 Resource Group

> 💡 **TL;DR** — the RG is Azure's **lifecycle + permission boundary**: things that live and
> die together share one. The platform's sharpest trick is *where RGs are split*: tenant
> workloads in the tenant's RG, but their Key Vault/Storage in a **separate platform RG**.

| Property | Value |
| --- | --- |
| **Scope** | tenant (workload RG) · platform (infra + data RGs) |
| **Created by** | tenant provisioning (`up-tenants`) · network/platform code |
| **IaC type** | `azurerm_resource_group` |

## 🧠 The concept
Two forces decide RG layout:
- **Lifecycle** — deleting an RG deletes everything in it, in one motion. Group by "would we
  ever delete these together?".
- **RBAC inheritance** — roles granted on an RG cascade to everything inside. Group by "who
  should own all of this?".

When those two disagree, split the RG. That's exactly the tenant-data case: the tenant owns
its workloads' lifecycle, but must *not* inherit admin power over its vault and storage —
so the data RG is platform-owned, with only data-plane grants back to the tenant.

## 🏗️ How it's used in this platform
- **Tenant RG**: created per tenant with role assignments from `up-tenants` (default
  permissions) — owners/members map to Entra groups.
- **Platform data RG(s)**: hold tenant×region [Key Vaults](res-key-vault.md) and
  [Storage](res-storage-account.md) — the "uses but cannot delete" boundary.
- **Network/hub RGs**: per region, platform-owned (`up-network`).

## ✅ Best practices we apply
- RG names encode owner + purpose + region — grep-able, tag-complemented.
- RBAC grants at the *narrowest* useful scope: RG-level by default, resource-level for
  exceptions, subscription-level almost never.
- Empty-RG hygiene: an RG nobody can explain is a deletion candidate with a ticket.

## ⚠️ Gotchas
- RG delete is recursive and fast — locks (`CanNotDelete`) on the ones that matter.
- Moving resources between RGs mid-life works but breaks IaC state assumptions — plan it.
- An RG is regional metadata, but its *resources* choose their own regions — don't infer.

## 🔗 Related
[Key Vault](res-key-vault.md) · [Storage](res-storage-account.md) · [tenants](tenants.md) ·
[identity-pim](identity-pim.md)

---
**Repo (map alias):** `up-tenants` (tenant RGs) · `up-network` (network RGs).
