# 🧭 DNS is the platform's phone book — and its weakest excuse for an outage

> 💡 **TL;DR** — DNS is the layer everything above the network depends on and nobody thinks
> about until it breaks. On this platform names are infrastructure: resolved on private zones
> so services find each other over the inspected path, never the public internet, and records
> follow the workloads that need them instead of being hand-maintained. Treat DNS as code with
> an owner, or accept that "it's always DNS" will keep being true.

## 1 · A name is a decision about trust and path

Resolving a name isn't just a lookup — it decides *where* the caller goes and *over which path*.
A service that resolves its database to a public endpoint has quietly routed sensitive traffic
over the internet; the same service resolving a **private** name stays inside the perimeter.
That's why data services live behind [private DNS zones](res-private-dns): the name
maps to a private address reachable only across the [inspected hub](network-hub-spoke),
so the resolution itself enforces the "every path crosses the hub" rule.

## 2 · Records as a side effect, not a chore

The failure mode of DNS is drift: a service moves, its record doesn't, and you get an outage
that looks like a bug three layers up. The fix is to stop maintaining records by hand.
[External DNS](landscape-external-dns) watches the ingresses and services that
actually exist and writes the records to match — so a new route publishes its own name and a
deleted one cleans up after itself. The record follows the workload because the same
declaration produces both.

## 3 · TTLs are a consistency knob, not a default

Every record carries a TTL, and it's a real [CAP-style tradeoff](blog-cap-theorem):
a long TTL means fast, cache-friendly lookups but slow propagation when something moves; a short
TTL means quick failover but more query load and less caching. The platform's rule of thumb —
short TTLs on things that fail over (ingress endpoints), longer on things that rarely move
(stable internal services) — is just choosing where you want to pay: latency now, or staleness
during a change.

## 4 · What I'd tell a team treating DNS seriously

1. **Resolve internal services on private zones.** If a name can resolve to a public address,
   someday it will, and your traffic leaves the perimeter without anyone deciding it should.
2. **Generate records from reality.** Hand-maintained zone files drift; records derived from
   live ingresses and services can't.
3. **Set TTLs on purpose.** Match the TTL to how often the target moves — don't inherit whatever
   the provider defaulted to.

## Related

[Private DNS zones](res-private-dns) · [Hub-and-spoke topology](network-hub-spoke) ·
[External DNS — records follow the routes](landscape-external-dns) ·
[The OSI model](blog-osi-model) · [CAP & consistency](blog-cap-theorem) ·
[✍️ all articles](blog-index)
