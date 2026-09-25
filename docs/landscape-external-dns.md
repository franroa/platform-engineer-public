# 🌐 External DNS — records follow the ingresses

> 💡 **TL;DR** — DNS is the classic "one manual step that outlives everyone's memory".
> External DNS watches ingresses/gateways and writes the records into the platform's DNS
> zones itself — names appear when a service does, and disappear with it. The
> [hub-and-spoke private DNS](network-hub-spoke) stays declarative.

## The job it does here

- **Per-cluster scope, per-zone ownership**: each cluster's controller may only touch its
  delegated zones — TXT ownership records make two controllers sharing a zone safe.
- **Ingress annotation → record**: the [library charts](landscape-helm) set the hostname;
  External DNS does the rest. Tenants never file "please create a CNAME" tickets.
- **Private and public split**: internal names land in private zones resolvable over
  [the VPN](vpn); nothing internal leaks to public DNS.

## What I'd tell you before adopting

1. Set `--txt-owner-id` per cluster from day one — ownership collisions are painful later.
2. Start with `--policy=upsert-only`; move to `sync` (deletes) once you trust the scoping.
3. Treat the zones as platform scope: created by terraform, written by controllers, never
   edited by hand.

## Where it runs

`ns: external-dns` · every cluster (`platform-services/base/`) · sync wave −1 · chart `external-dns 1.15.0`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: watches the HTTPRoutes tenants create and reconciles the platform DNS zone.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-external-dns)

## Related

[Hub-and-spoke network](network-hub-spoke) · [Helm](landscape-helm) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[DNS is the platform's phone book — and its weakest excuse for an outage](blog-dns) ·
[From on-premises to cloud — migrate the operating model](blog-migration-onprem-cloud) ·
[Helm — the packaging grammar](landscape-helm) ·
[The landscape — CNCF & friends I actually run](landscape-index)
