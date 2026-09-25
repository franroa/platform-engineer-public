# 🎯 CAP is a decision you already made — here's where

> 💡 **TL;DR** — CAP says that when the network partitions, a distributed system can keep
> **consistency** or **availability**, not both. The trap is treating it as a whiteboard
> abstraction; in practice you make the CAP call every time you decide where data lives and how
> far it replicates. This platform makes those calls deliberately: tenant data is placed per
> region, secrets are per tenant-region, and "global" is reserved for the few things that can
> tolerate eventual consistency. CAP isn't a theorem you admire — it's a placement policy.

## 1 · The theorem, minus the folklore

Consistency, Availability, Partition-tolerance — pick two. But partitions aren't optional in a
multi-region system: networks *will* split, so P is a given, and the real choice is
**C or A when it happens**. A payment ledger picks C (refuse writes rather than double-spend);
a session cache picks A (serve slightly stale rather than fail). The theorem's only demand is
that you *choose on purpose* per dataset, instead of discovering your choice during an outage.

## 2 · Placement is the CAP decision

Where a dataset lives *is* its CAP posture. This platform's [global
footprint](global-footprint) draws a hard line between **regional** and **global** data.
Tenant workloads and their [PostgreSQL](res-postgresql) run *in a region* — a
partition between regions can't make that data inconsistent, because there's one authoritative
copy and requests are served locally (availability within the region, consistency by not
distributing in the first place). The things allowed to be global are chosen precisely because
they tolerate lag: identity metadata, catalog data, config that converges.

## 3 · Isolation makes the choice cheap

CAP gets nasty when one shared datastore serves everyone, because now every tenant inherits the
same C-or-A compromise. [Per-tenant, per-region Key Vaults](blog-tenant-keyvaults)
sidestep that: a partition affecting one region's vault doesn't stall another tenant in another
region, because there's no cross-region coupling to break. [Tenant
isolation](tenants) isn't only a security property — it's what keeps one tenant's
availability decision from becoming everyone's consistency problem.

## 4 · The corollary — latency is CAP's daily face

Partitions are rare; latency is constant, and it's the same tradeoff wearing everyday clothes.
Replicating a write to another region for durability *costs* the round trip on every write —
that's the "consistency tax." Placing data next to the workload that uses it is usually the
right default not because partitions are common, but because the latency bill is paid on every
single request, partition or not.

## 5 · What I'd tell a team making the call

1. **Decide C-vs-A per dataset, and write it down.** "Which do we drop under partition?" should
   have an answer before the outage, not during.
2. **Default to regional.** Keep data next to its workload; promote to global only for things
   that genuinely tolerate staleness.
3. **Watch the latency tax, not just the outage.** Cross-region consistency costs you on every
   write forever — make sure the data is worth it.

## Related

[Global footprint & regions](global-footprint) · [PostgreSQL](res-postgresql) ·
[Tenant Key Vaults](blog-tenant-keyvaults) · [Tenants & isolation](tenants) ·
[The OSI model](blog-osi-model) · [✍️ all articles](blog-index)
