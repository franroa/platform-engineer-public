# 🗄️ Storage Account

> 💡 **TL;DR** — the general-purpose data primitive (blobs, tables, queues, files), created
> **per tenant × region** in the separate platform RG, private-endpoint-only, accessed with
> Entra identities — **shared keys disabled**.

| Property | Value |
| --- | --- |
| **Scope** | tenant×region (platform RG) · plus platform accounts (state, flow logs) |
| **Created by** | `up-modules` (storage module) |
| **Access** | Entra RBAC (`ARM_USE_AZUREAD`) · no account keys · private endpoints |

## 🧠 The concept
Storage accounts default to a 1970s auth model: two account-wide shared keys that grant
everything and rotate never. Modern usage flips every default: disable shared keys, grant
scoped RBAC data roles to identities, close public network access, and put each sub-service
(blob/dfs/table/queue) behind its own [private endpoint](res-private-endpoint.md).

## 🏗️ How it's used in this platform
- Tenant data accounts via the module — private, identity-only, in the platform RG.
- **Terraform state** lives in storage accounts accessed with Entra auth — pipelines and
  humans need the data-plane role, not a key (the classic 403-on-`listKeys` is by design).
- Each needed sub-resource gets its own endpoint (the inventory shows `blob`/`dfs`/`table`
  endpoints per account).

## ✅ Best practices we apply
- `shared_access_key_enabled = false` — keys and SAS are off the table entirely.
- Data-plane RBAC (`Blob Data Contributor` etc.) — control-plane `Contributor` reads nothing.
- Versioning/soft-delete on blobs that matter; lifecycle rules for logs.

## ⚠️ Gotchas
- Tools that "just worked" via keys break on key-disable — they need `--auth-mode login`
  (or `ARM_USE_AZUREAD=true` for terraform state).
- RBAC propagation lags a few minutes — a fresh grant that 403s is usually just early.
- Account names are globally unique and 24 chars max — naming schemes hit this wall fast.

## 🔗 Related
[Private Endpoint](res-private-endpoint.md) · [Key Vault](res-key-vault.md) ·
[Resource Group](res-resource-group.md) · [Log Analytics](res-log-analytics.md)

---
**Repo (map alias):** `up-modules` · provisioning: `up-tenants`.

## ✍️ Related writing

[A backup is a tag, not a ticket](blog-backups) ·
[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[A SAS token is a one-year password you forgot you minted](blog-storage-proxy)
