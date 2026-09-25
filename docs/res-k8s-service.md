# 🔗 Kubernetes Service

> 💡 **TL;DR** — a Service is the **stable name in front of moving pods**: one virtual IP +
> DNS name that load-balances to whatever pods currently match its selector. Deployments
> come and go; the Service endures.

| Property | Value |
| --- | --- |
| **Scope** | app (inside its [namespace](res-namespace.md)) |
| **Created by** | the app's Helm chart (`up-helm-charts`) |
| **IaC type** | K8s `v1/Service` (ClusterIP) |

## 🧠 The concept
Pods are ephemeral — IPs change on every reschedule. A Service decouples *consumers* from
*instances*: selector-matched pods become endpoints behind one ClusterIP and DNS name
(`svc.namespace.svc.cluster.local`). That indirection is what makes rolling updates,
autoscaling and canaries invisible to callers.

## 🏗️ How it's used in this platform
- Apps expose **ClusterIP** services only; external exposure happens exclusively via
  [HTTPRoute](res-httproute.md) → [ALB + WAF](res-ingress-waf.md). No LoadBalancer services
  per app — that would mint public IPs around the WAF.
- Service definitions ship in the app's chart from `up-helm-charts` — teams write values,
  not boilerplate.

## ✅ Best practices we apply
- Name ports (`http`, `grpc`) — HTTPRoutes and probes reference them by name.
- One Service per protocol/contract; don't multiplex unrelated ports.
- Selector labels are an API: change them consciously (a typo = instant empty endpoints).

## ⚠️ Gotchas
- A Service with **no ready endpoints** answers connection-refused — check readiness probes
  before debugging the network.
- ClusterIP is cluster-internal by definition — "curl from my laptop" needs the
  [VPN](vpn.md) + a route, not a bigger Service type.

## 🔗 Related
[HTTPRoute](res-httproute.md) · [Namespace](res-namespace.md) ·
[Helm Release](res-helm-release.md) · [Ingress + WAF](res-ingress-waf.md)

---
**Repo (map alias):** `up-helm-charts` (charts).
