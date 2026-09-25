# ⛃ A backup is a tag, not a ticket

> 💡 **TL;DR** — nobody should ever *request* a backup. A resource declares how bad it would
> be to lose its data — one tag, `data_criticality = important | critical` — and the platform
> does the rest: routes it to the right vault, replicates the critical tier to the paired
> region, and refuses to let anyone opt out. Recovery posture becomes a property of the
> resource, not a promise in a wiki.

## 1 · The question nobody answers per resource

Every backup conversation eventually collapses into the same question: *how bad is it if
this data is gone?* Ask it per resource and you get honest answers — this database is the
tenant's source of truth (`critical`), that bucket is re-derivable in an hour (`standard`).
Ask it per team, per quarter, in a spreadsheet, and you get the usual thing: a backup policy
that was true the day it was written.

So the platform makes the question part of the resource itself. Terraform-vended modules
carry a `data_criticality` variable; its value lands on the Azure resource as a tag. That
tag is the entire interface to the backup system — there is no other one.

## 2 · Two vaults per region, routed by the answer

Each `(sector, tier, region)` runs **two vault pairs** — Data Protection + Recovery Services
each — and the tag decides which pair a resource lands in:

- **`critical`** → the GeoZone-redundant pair. The copy survives a zone loss *and* a region
  loss: Azure replicates it to the region's paired region over Microsoft's backbone, and
  cross-region restore is enabled. On [the map's globe](res-backup-vault) that replica is a
  dashed arc — dashed because no customer network path exists; the
  [hub-and-spoke topology](network-hub-spoke) is deliberately bypassed.
- **`important`** → the Zone-redundant pair. Survives a zone outage, **not** geo-replicated —
  important-tier data doesn't justify the cost or the data-residency surface of a copy in a
  second geography. Saying that out loud, in code, is the point: the *absence* of a geo copy
  is a reviewed decision, not an oversight.

Sandbox runs both pairs locally-redundant, purely so routing works identically everywhere.

## 3 · Enrolment is enforced, not requested

The tag would be theater if a human still had to connect resource to vault. Three mechanisms
close the loop, none of them a ticket:

- **DINE policies** ("deploy if not exists") watch for disks and VMs carrying the tag and
  auto-create the vault instance in the criticality-matched vault, the moment the resource
  appears.
- **Daily discovery jobs** sweep for tagged [database servers](res-postgresql) and
  [storage accounts](res-storage-account) and enrol them. At `important`/`critical` there is
  **no opt-in flag** — vault protection is mandatory, and the only way to leave is a
  git-tracked, time-bound policy exemption.
- **AKS persistent volumes** opt in per label through the cluster's backup extension.

```hcl
# the entire backup interface, as seen from a consuming module
data_criticality = "critical"   # → GeoZone vault, paired-region restore, no opt-out
```

## 4 · The vault is the belt, not the trousers

One rule keeps the design honest: **vault is additive, never a replacement**. Point-in-time
restore on the database and soft-delete on storage remain the *primary* recovery path — they
are faster, cheaper, and closer to the failure. The vault exists for the long tail: the
deleted server, the compromised subscription, the region that isn't coming back today. If a
restore drill reaches for the vault first, something upstream is misconfigured.

## 5 · Changes ride a canary, like everything else

A retention change touches every region's recovery posture, so it deploys like any other
platform change: merge to main, deploy to one canary tuple, and a smoke test asserts the
Azure-side state matches Terraform's view — vaults exist, roles assigned, no protection
errors, every tagged resource enrolled. Only then does it auto-promote to the remaining
tuples. No manual button, no "we'll roll it out next sprint."

The alternative — backups as tickets — fails quietly and gets audited loudly. A tag that
routes, policies that enforce, and a drill that proves restore is the version where "we have
backups" is a fact the platform can check, not a sentence someone remembers writing.

## Related

[Backup Vault — criticality-routed data protection](res-backup-vault) ·
[Hub-and-spoke network](network-hub-spoke) ·
[Storage Account](res-storage-account) · [Azure PostgreSQL](res-postgresql)
