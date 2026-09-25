# ⛃ Backup Vault — criticality-routed data protection

> 💡 **TL;DR** — every region runs **two vault pairs**: a GeoZone-redundant pair for
> **critical** data (survives a region loss, cross-region restore) and a Zone-redundant
> pair for **important** data (survives a zone loss, no geo copy). Nothing is enrolled by
> hand — a **tag** on the resource decides whether it's protected and by which vault.

| Property | Value |
| --- | --- |
| **Scope** | two Data Protection + two Recovery Services vaults per (sector, tier, region) |
| **Created by** | `up-backups` |
| **Routing key** | resource tag `data_criticality = important \| critical` |
| **Delivery** | trunk-based · canary tuple + automated smoke test gates promotion to all tuples |

## 🧠 The logic
Backups answer one question per resource: *how bad is it if this data is gone?* The answer
is a **tag**, not a runbook:

- `critical` → the GeoZone-redundant vault. The copy is replicated to the region's Azure
  **paired region** over Microsoft's backbone (the dashed arc on the globe — no customer
  network path exists or is needed), and cross-region restore is enabled.
- `important` → the Zone-redundant vault. Survives a zone outage; deliberately **not**
  geo-replicated — important-tier data doesn't justify the cost or the data-residency
  surface of a second region.
- anything else → no vault. Built-in mechanisms still apply (see below).

Enrolment is enforced, not requested:
- **DINE policies** ("deploy if not exists") auto-enrol disks and VMs the moment they carry
  the tag — the policy points at the criticality-matched vault.
- **Daily discovery jobs** find database servers and storage accounts by the same tag and
  create vault instances. At `important`/`critical` there is **no opt-in flag** — vault is
  mandatory.
- **AKS persistent volumes** opt in per label via the cluster's backup extension.

**Vault is additive, never a replacement.** Point-in-time restore on the database and
soft-delete on storage remain the *primary* recovery path — the vault is the long-tail,
belt-and-suspenders copy for the two tiers that warrant it.

## 🗺️ What the map draws
The **globe only draws backups that cross a region boundary** — a geo-replica arc to the
cloud's paired region, or a disaster-recovery pairing where one platform region holds
another's cross-region copy. Vaults that never leave their region don't earn a globe mark;
their chip lives inside the region view's services strip instead. A map that draws every
vault says nothing — the arcs that survive a region loss are the DR diagram
(see [Disaster recovery is a rehearsal, not a binder](blog-disaster-recovery)). Diagnostic
logs from all vaults land in Log Analytics; dashboards and alert rules ship with the repo.

## ⚙️ Lifecycle & change
A retention or policy change is an MR in `up-backups`. Merges deploy to a **canary**
(sector-sandbox-eu01) where a smoke test asserts the Azure-side state matches Terraform —
vaults exist, roles assigned, no protection errors, every tagged resource enrolled — and
only then auto-promote to the remaining (sector, tier, region) tuples. No manual button.

## 🔗 Related concepts
[Storage Account](res-storage-account.md) · [Azure PostgreSQL](res-postgresql.md) ·
[AKS Cluster](res-aks.md) — the things being protected ·
[Hub-and-spoke network](network-hub-spoke.md) — the topology the vaults live in
(geo-replication bypasses it by design).

## ✍️ Related writing

[A backup is a tag, not a ticket](blog-backups) ·
[Disaster recovery is a rehearsal, not a binder](blog-disaster-recovery)
