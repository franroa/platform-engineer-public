# 🛣️ HTTPRoute (Gateway API)

> 💡 **TL;DR** — the HTTPRoute is the app's **publication contract**: "this hostname/path →
> that [Service](res-k8s-service.md)". The platform's ALB reconciles it into real Azure
> routing; DNS and TLS follow automatically. Publishing an app is a YAML, not a ticket.

| Property | Value |
| --- | --- |
| **Scope** | app (namespace-scoped, attaches to the platform Gateway) |
| **Created by** | the app's chart (`up-helm-charts`) |
| **IaC type** | `gateway.networking.k8s.io/HTTPRoute` |

## 🧠 The concept
Gateway API splits ingress into roles: the **Gateway** (infrastructure — owned by platform)
and the **HTTPRoute** (application — owned by the team). Routes *attach* to gateways under
rules the gateway sets. This fixes classic Ingress's ownership blur: teams self-serve routes,
platform owns the listener, TLS policy and the [WAF](res-ingress-waf.md) in front.

## 🏗️ How it's used in this platform
- The app declares hostname + path + backend Service (+ optional canary weights, header
  matches). The chart renders it; the ALB controller programs Azure.
- [cert-manager](res-cert-manager.md) delivers the TLS secret; external-dns writes the DNS
  record — the route is the *only* thing the team writes.
- All traffic passes the WAF **before** any pod — there is no route around it.

## ✅ Best practices we apply
- Routes live **with the app** (same chart, same lifecycle) — not in a central routing repo.
- Weighted backends for canaries — traffic shifting is a values change, not a redeploy.
- Cross-namespace backend references require explicit `ReferenceGrant`s — default-deny stays.

## ⚠️ Gotchas
- A route that doesn't attach (`Accepted: False`) usually violates the Gateway's allowed
  namespaces/hostnames — read the route *status*, it says why.
- Conflicting hostname+path claims between teams resolve by Gateway API precedence rules —
  surprising until you read them.

## 🔗 Related
[Ingress + WAF](res-ingress-waf.md) · [K8s Service](res-k8s-service.md) ·
[cert-manager](res-cert-manager.md) · [Helm Release](res-helm-release.md)

---
**Repo (map alias):** `up-helm-charts` (charts) · gateway: `up-kubernetes`.

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[Load balancing — L4 moves connections, L7 makes decisions](blog-load-balancing) ·
[The OSI model, one layer at a time — and where each one runs here](blog-osi-model) ·
[Blue-green and canary — ship to a few before you ship to everyone](blog-progressive-delivery) ·
[Twelve-Factor isn't a checklist — it's what the platform makes free](blog-twelve-factor) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik) ·
[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager)
