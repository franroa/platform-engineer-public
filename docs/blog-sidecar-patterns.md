# 🛺 The sidecar pattern: capabilities a pod wears, not code it imports

> 💡 **TL;DR** — a sidecar is a second container in the pod that gives the app a capability
> **without the app knowing**: auth ([oauth2-proxy](blog-traefik-oauth)), building-block APIs
> ([Dapr](landscape-dapr)), telemetry shipping ([OTel](landscape-opentelemetry)). It's the
> platform's favorite delivery vehicle for cross-cutting concerns because it upgrades like
> infrastructure (a pod restart) instead of like code (N teams bumping a library). The cost
> is real — one more container's worth of resources and startup ordering — so each sidecar
> has to earn its seat.

## 1 · The idea, in one sentence

Containers in a pod share network (localhost) and can share volumes — so a helper container
can sit *in the app's own network namespace* and do things on its behalf: terminate auth,
proxy egress, translate protocols, ship logs. The app stays a plain HTTP server on localhost.

## 2 · The three classic shapes (and where this platform uses each)

- **Sidecar (enhance):** adds a capability alongside the app. Here: **oauth2-proxy** in front
  of every tenant app behind the [shared gateway](landscape-traefik) — the route targets the
  proxy's :4180, the proxy forwards to localhost. Auth becomes a pod property, not a code
  path.
- **Ambassador (proxy out):** the app talks to `localhost`, the ambassador finds/talks to the
  real backend. Here: **[Dapr](landscape-dapr)** — pub/sub and state calls go to the sidecar,
  which speaks to whichever broker or store the platform actually configured. Swapping the
  backend is an infra change, invisible to code.
- **Adapter (translate):** normalizes what the app exposes into what the platform expects.
  Here: the **[OTel Collector](landscape-opentelemetry)** agent shape — heterogeneous app
  telemetry goes in, one standard comes out.

One rule of thumb separates them: sidecar changes what *enters* the pod, ambassador what
*leaves* it, adapter what it *exposes*.

## 3 · What a sidecar costs (the part evangelism skips)

1. **Resources are per-pod, not per-cluster.** Every replica pays the sidecar's
   requests/limits — and an unaccounted sidecar breaks the [Guaranteed-QoS math](kubernetes)
   the CI runners rely on. Budget it explicitly.
2. **Startup ordering is your problem.** The app may boot before its proxy is ready;
   native sidecar containers (initContainers with `restartPolicy: Always`) or readiness
   gating fix it — hope does not.
3. **It's still a fleet upgrade.** One oauth2-proxy CVE = every tenant pod restarts. Better
   than N libraries, but plan the rollout like the [builder-image rebuild](landscape-buildpacks):
   one owner, every consumer inherits.

## 4 · When NOT to sidecar

If the capability is genuinely cluster-scoped — scanning ([Trivy](landscape-trivy)), policy
([Kyverno](landscape-kyverno)), cost metering ([OpenCost](landscape-opencost)) — one
controller/DaemonSet beats N sidecars on every axis. The sidecar earns its seat only when the
capability must live *inside the pod's trust or network boundary*: per-tenant auth, per-app
egress, per-pod translation.

## Related

[One gateway, one login](blog-traefik-oauth) · [Dapr](landscape-dapr) ·
[Multi-tenant Kubernetes](blog-kubernetes) · [🗺️ landscape](landscape-index)
