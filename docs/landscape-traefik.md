# 🚦 Traefik — one shared gateway, many tenant routes

> 💡 **TL;DR** — [Traefik](https://traefik.io/traefik/) is the platform's **in-cluster service
> gateway: exactly ONE instance per cluster** (`ns: gateway`, platform-owned), and every
> tenant publishes through it with their own namespace-scoped `HTTPRoute`. Tenants never
> deploy a gateway — they attach to the shared one by `parentRef`, the same "one instance,
> every tenant consumes it" shape as [Grafana](landscape-grafana) for dashboards. SSO rides
> next to each app as an [oauth2-proxy sidecar](blog-traefik-oauth), so the gateway stays
> auth-agnostic.

## The job it does here

- **The single routing front door inside the cluster.** The edge stays Azure —
  [ALB/AGfC + WAF](res-ingress-waf) terminates TLS and filters at the perimeter — and hands
  requests to the one Traefik gateway, which fans out to tenant `HTTPRoute`s. Two tiers, one
  responsibility each: the edge protects, the gateway routes.
- **Tenants self-serve routes without owning infrastructure.** A tenant ships an
  [HTTPRoute](res-httproute) in their own namespace (`parentRef: gateway/shared-gateway`);
  nobody files a ticket for a hostname, and nobody runs their own ingress controller — the
  [multi-tenancy rule](blog-tenant-isolation) applied to traffic: shared engine, separate
  blast radius.
- **Middleware where it belongs.** Cross-cutting concerns (forwardAuth, rate limits,
  redirects) are gateway middleware — declared once, referenced per route — instead of
  being re-implemented inside every app. The [OAuth pattern](blog-traefik-oauth) is the
  worked example; `up-gateway/routes/fabrikam-rate-limit.yaml` shows the other one — a
  **per-tenant rate limit** as an `ExtensionRef` filter, with the `Middleware` living in the
  tenant's own namespace so the tenant tunes its budget in its own MR.
- **Cross-namespace backends are denied by default.** A route in tenant A can't quietly target
  tenant B's Service — Gateway API demands a **ReferenceGrant in the target namespace**
  (`up-gateway/routes/reference-grant-example.yaml`: one caller namespace, one named Service,
  never a wildcard). The deny-by-default *is* the tenancy model applied to traffic.

## What I'd tell you before adopting

1. **Resist the second gateway.** The moment a tenant runs their own ingress "just for us,"
   the shared-gateway model is dead and you're operating N snowflake proxies. Escape hatches
   go through [a reviewed exception](landscape-kyverno), not a quiet `helm install`.
2. **Gateway API over vendor CRDs where possible.** `HTTPRoute` keeps tenant manifests
   portable; reach for Traefik-specific middleware CRDs only where the standard has no
   equivalent yet.
3. **The gateway is a shared fate zone — treat it like one.** One instance per cluster means
   its resource limits, PDB and rollout strategy deserve the same care as the control plane;
   a bad gateway rollout is every tenant's outage at once. Here that's not a caution, it's
   enforced and rehearsed: `up-gateway/gateway/pdb.yaml` floors disruption, and
   [Litmus](landscape-litmus) kills gateway pods on a schedule
   (`up-gateway/chaos/gateway-pod-kill.yaml`) with a continuous through-the-gateway HTTP probe
   as the steady-state hypothesis — see [failure modes](failure-modes).

## Where it runs

`ns: gateway` · every cluster (`platform-services/base/`) · sync wave −1 (routes can't attach
to a gateway that isn't there) — pinned in [`up-kubernetes`](kubernetes)
`gitops/platform-services/`. The Gateway resource, shared middleware and the per-tenant
routes/workloads live in **`up-gateway`** — one repo answers "what publishes through the
gateway, and as whom."

[**▶ See it in the cluster**](#aks=eu01&d=landscape-traefik)

## Related

[One gateway, one login — OAuth for every tenant route](blog-traefik-oauth) ·
[HTTPRoute — the publication contract](res-httproute) ·
[Ingress + WAF — the Azure edge](res-ingress-waf) ·
[A 403 is usually the fence doing its job](blog-tenant-isolation) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

["What happens when it dies?" is the whole architecture review](blog-failure-modes) ·
[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[One gateway, one login: SSO for every tenant route](blog-traefik-oauth) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus)
