# 🧱 App Gateway for Containers + WAF

> 💡 **TL;DR** — the **front door for HTTP(S)**: Azure's Application Gateway for Containers
> (AGfC/ALB) terminates TLS and routes into the cluster via Gateway API
> ([HTTPRoute](res-httproute.md)); a **WAF policy in Prevention mode** inspects everything
> before it reaches a pod.

| Property | Value |
| --- | --- |
| **Scope** | cluster (ALB) + policy as code (WAF) |
| **Created by** | `up-kubernetes` (ALB controller) · `up-waf` (WAF policy) |
| **Consumed by** | every externally-exposed app route |

## 🧠 The concept
Two separable concerns, deliberately kept separate:
- **Routing** — Gateway API resources (`Gateway`, `HTTPRoute`) map hostnames/paths to
  Services. The ALB controller programs Azure from these K8s resources.
- **Security** — a WAF policy (OWASP DRS + bot rules, Prevention not Detection) attached to
  the gateway via CRD. Security teams change the *policy repo*; app teams change *routes*;
  neither blocks the other.

## 🏗️ How it's used in this platform
- Apps publish an [HTTPRoute](res-httproute.md); the ALB reconciles it — no ticket, no
  central routing table.
- TLS certificates arrive via [cert-manager](res-cert-manager.md); DNS records via
  external-dns. Publishing an app is *declaring* it.
- The WAF policy lives in `up-waf` as code — auditable, versioned, promoted like any
  other change.

## ⚙️ Lifecycle & change
Controller upgrades via `up-kubernetes`. WAF rule exceptions (false positives) are MRs in
`up-waf` with the triggering rule ID documented.

## ✅ Best practices we apply
- **Prevention mode** from day one — Detection-only WAFs never get promoted.
- Route ownership with the app (namespace-scoped HTTPRoutes), gateway ownership with platform.
- Log blocked requests to [Log Analytics](res-log-analytics.md); review rule hits, not vibes.

## ⚠️ Gotchas
- WAF false positives surface as mysterious 403s — check rule-match logs before blaming apps.
- Gateway API ≠ classic Ingress: annotations from nginx tutorials do nothing here.
- Cross-namespace routes need explicit `ReferenceGrant`s — deny by default is intentional.

## 🔗 Related
[HTTPRoute](res-httproute.md) · [K8s Service](res-k8s-service.md) ·
[cert-manager](res-cert-manager.md) · [WAF view](waf.md)

---
**Repos (map aliases):** `up-kubernetes` + `up-waf`.

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[Load balancing — L4 moves connections, L7 makes decisions](blog-load-balancing) ·
[The OSI model, one layer at a time — and where each one runs here](blog-osi-model) ·
[TLS is easy; rotating certificates without downtime is the real job](blog-tls-rotation) ·
[One gateway, one login: SSO for every tenant route](blog-traefik-oauth) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik) ·
[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager)
