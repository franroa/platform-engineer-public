# 🌋 Disaster recovery is a rehearsal, not a binder

> 💡 **TL;DR** — a DR plan you haven't executed is a guess with a table of contents. The
> platform treats region loss as a *scheduled event*: critical data already lives in a second
> geography, one region pair is designated as the restore target, and a pipeline rehearses
> the restore on a schedule — into an isolated resource group, asserting the data is usable.
> The globe only draws backups that cross a region boundary, because those are the only ones
> that matter on that map.

## 1 · The scenario everyone defers

Every architecture review has the same five minutes: *what if the region goes away?* Someone
says "we have geo-redundant backups," everyone nods, the meeting moves on. Three assumptions
hide in that sentence — the copy exists, the copy is *outside* the blast radius, and someone
can turn the copy back into a running system before the business notices. Only the first one
is usually true by default.

So the platform makes each assumption a checkable fact instead of a nod.

## 2 · The copy exists, and it's genuinely elsewhere

[Backups are routed by a tag](blog-backups), and the `critical` tier is the one that leaves
home. Two distinct cross-region shapes, drawn distinctly on
[the globe](res-backup-vault):

- **Geo-replica to the paired region** — the critical vault is GeoZone-redundant; the
  provider replicates it over its own backbone to the region's designated pair, and
  cross-region restore is enabled. It's drawn as a dashed arc because there is no customer
  network path to secure — the [hub-and-spoke topology](network-hub-spoke) is bypassed by
  design.
- **A DR region pair** — one platform region holds the cross-region backup copy for another.
  Unlike the paired-region replica, this target is a *full platform region*: same
  [identity, network and cluster envelopes](global-footprint), so a restored workload lands
  somewhere it can actually run.

Everything that *doesn't* cross a region — the zonal `important` vaults doing their quiet
daily work — deliberately doesn't appear on the globe. A map that draws every vault says
nothing; a map that only draws the arcs that survive a region loss is a DR diagram.

## 3 · The restore is rehearsed, on a schedule

The third assumption — *someone can restore it* — is the one that rots fastest. Snapshots
accumulate, schemas drift, the one person who did it last time changes teams. The platform's
answer is a **restore drill**: a scheduled pipeline that takes the newest recovery point,
restores it into an **isolated resource group** in the DR target region, and asserts the
data is usable — a query against the restored database, a checksum against the restored
blob, torn down afterwards.

```yaml
# the drill is a pipeline, not a runbook
restore-drill:
  schedule: weekly
  steps: [restore-latest → isolated-rg, assert-usable, teardown]
```

The drill failing is a page, not a postmortem finding. That's the entire point: the gap
between "backup exists" and "service restored" is measured while it's cheap.

## 4 · What the rehearsal buys you

When the real event comes, the questions left are the ones no drill can answer — DNS
cutover, customer comms, which tenant goes first. What's *not* in question is whether the
copy exists, where it is, or whether restore works, because the platform has been quietly
answering those every week. A binder documents intentions. A pipeline documents capability.

## Related

[Backup Vault — criticality-routed data protection](res-backup-vault) ·
[A backup is a tag, not a ticket](blog-backups) ·
[Global footprint & regions](global-footprint) ·
[Hub-and-spoke network](network-hub-spoke)
