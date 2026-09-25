# 🐘 Azure PostgreSQL (Flexible Server)

> 💡 **TL;DR** — managed PostgreSQL **per tenant × region**, in the platform RG, reachable
> only privately. Azure runs patching/HA/backups; we own schemas, roles, sizing — and the
> discipline that *databases are cattle-configured but pet-treated*.

| Property | Value |
| --- | --- |
| **Scope** | tenant×region (platform RG) |
| **Created by** | `up-modules` (database module) |
| **Access** | private networking + Entra-integrated auth where possible |

## 🧠 The concept
"Managed" moves the undifferentiated toil (OS, minor versions, WAL, failover) to Azure, but
the decisions that hurt stay yours: **networking** (private only), **auth** (Entra
integration over passwords), **sizing** (burstable vs provisioned), **HA** (zone-redundant
standby or not — it doubles cost) and **backup retention/PITR**. A DB is the least
reversible thing in a stack: defaults must be safe, and deletion must be hard.

## 🏗️ How it's used in this platform
- One server per tenant×region via the module; connection reachable only inside the network
  ([private endpoint](res-private-endpoint.md) / private access + [private DNS](res-private-dns.md)).
- Long-term backups (LTR) are wired into the platform backup machinery — restore paths are
  code, not wiki lore.
- Credentials, where unavoidable, live in the tenant [Key Vault](res-key-vault.md) and reach
  pods via external-secrets.

## ✅ Best practices we apply
- PITR retention set consciously; **restore drills**, not restore hopes.
- `prevent_destroy` + protected stages: a DB never dies in a routine apply (the OPA gate
  blocks protected destroys — see [security-opa](security-opa.md)).
- Per-app database roles; the admin role is for the platform, not for services.

## ⚠️ Gotchas
- Flexible Server maintenance windows still cause brief failovers — clients need retry logic.
- Cross-region DR is *your* design (read replicas / geo-backup), not a checkbox.
- Connection limits scale with SKU — pool (pgbouncer) before scaling up for connection count.

## 🔗 Related
[Key Vault](res-key-vault.md) · [Private Endpoint](res-private-endpoint.md) ·
[Resource Group](res-resource-group.md) · [security-opa](security-opa.md)

---
**Repo (map alias):** `up-modules` · provisioning: `up-tenants`.

## ✍️ Related writing

[A backup is a tag, not a ticket](blog-backups) ·
[CAP is a decision you already made — here's where](blog-cap-theorem) ·
[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes)
