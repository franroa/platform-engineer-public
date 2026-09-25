# 📜 cert-manager

> 💡 **TL;DR** — certificates as a *controller*, not a calendar entry: cert-manager watches
> `Certificate` resources, obtains and renews TLS material automatically. Installed **first**
> among cluster services because everything with a hostname depends on it.

| Property | Value |
| --- | --- |
| **Scope** | cluster service (per cluster) |
| **Created by** | `up-kubernetes` (with its ClusterIssuer) |
| **Consumed by** | [ingress/ALB](res-ingress-waf.md), any TLS-serving workload |

## 🧠 The concept
The certificate lifecycle (CSR → issue → store → **renew before expiry**) is exactly the kind
of toil humans forget. cert-manager reconciles it: declare a `Certificate` (or annotate a
route), and a controller keeps a valid secret in place forever. Issuers abstract the CA —
ACME/Let's Encrypt, private PKI — behind one API.

## 🏗️ How it's used in this platform
- A platform-managed **ClusterIssuer** (DNS-01 via Azure DNS, using workload identity — no
  CA secrets in-cluster).
- App teams never *handle* certificates: an [HTTPRoute](res-httproute.md) with a hostname
  gets TLS material delivered to the right namespace automatically.
- Deployed by `up-kubernetes` before the ingress stack — the dependency order is explicit.

## ⚙️ Lifecycle & change
Upgrades via `up-kubernetes` (CRDs first — read release notes). Issuer changes are rare and
platform-owned.

## ✅ Best practices we apply
- **DNS-01** challenges (works for private/wildcard certs; HTTP-01 needs public reachability).
- Renewal at ⅔ of lifetime; alert on `Certificate` not-Ready.
- One ClusterIssuer, many Certificates — no per-team issuers.

## ⚠️ Gotchas
- CRD upgrades are the sharp edge of cert-manager upgrades — never skip the migration notes.
- A wrong DNS-01 credential fails *renewals* silently until certs near expiry — monitor Ready
  status, not just expiry dates.

## 🔗 Related
[Ingress + WAF](res-ingress-waf.md) · [HTTPRoute](res-httproute.md) ·
[Private DNS](res-private-dns.md) · [AKS](res-aks.md)

---
**Repo (map alias):** `up-kubernetes`.

**📓 Runbook:** [certificate expiry / cert-manager not renewing](runbook-cert-expiry.md)

## ✍️ Related writing

[TLS is easy; rotating certificates without downtime is the real job](blog-tls-rotation) ·
[The landscape — CNCF & friends I actually run](landscape-index)
