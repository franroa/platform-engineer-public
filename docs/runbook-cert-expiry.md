# 🚨 Runbook — certificate expiry / cert-manager not renewing

> 💡 **TL;DR** — TLS on a route is failing or a `Certificate` is inside its renewal window and
> not renewing. Nine times out of ten it's DNS-01 solver permissions or a stuck order.
> Diagnose from the `Certificate` → `CertificateRequest` → `Order` → `Challenge` chain — the
> failure is always spelled out in one of those four statuses. **Never** hand-issue a cert to
> "fix it fast": the controller will fight you, and the manual cert becomes untracked drift.

| Property | Value |
| --- | --- |
| **Severity when firing** | high (public routes) · medium (internal routes) |
| **Owning view** | [Kubernetes](kubernetes.md) · [cert-manager](res-cert-manager.md) |
| **Signal** | `CertificateNotReady` alert · browser TLS error · `certmanager_certificate_expiration_timestamp_seconds` |

## 🧭 Triage (5 minutes)

1. **Scope it.** One host or many? One cluster or all regions? All-regions failure points at
   the CA/ACME or the DNS zone, not the cluster.
2. **Walk the chain** in the affected namespace:
   `Certificate` (Ready? Renewal time?) → `CertificateRequest` → `Order` → `Challenge`.
   The first resource whose status is not `Ready`/`Valid` names the culprit in its message.
3. **Classify:**
   - `Challenge` pending on DNS-01 → the solver couldn't write the TXT record: check the
     workload-identity federation and the DNS zone role assignment (`up-kubernetes` owns both).
   - `Order` errored with rate-limit → ACME rate limits; wait, don't churn (deleting the
     Certificate makes it WORSE — new orders burn more quota).
   - `Certificate` Ready but the route still serves the old cert → the consumer didn't reload:
     check the ingress/gateway secret reference and Reloader.

## 🔧 Recover

- **Stuck order/challenge:** delete the `Order` (not the `Certificate`) — the controller
  re-creates it cleanly.
- **Solver permission lost:** re-apply the `up-kubernetes` services stage (it owns the
  ClusterIssuer + the DNS role assignment); confirm with a fresh `Challenge` going `Valid`.
- **Emergency only:** if a public route must come up before the chain is fixed, front it at
  the [WAF/ALB](res-ingress-waf.md) with the wildcard fallback cert — and open a drift note,
  because that fallback in use IS an incident artifact.

## 🧯 Afterwards

- Confirm the renewal timestamp moved (`kubectl get certificate -A` — RENEWAL column).
- If the cause was a permission or zone change made outside code, file it as
  [drift](runbook-drift-response.md) and land the fix in the owning repo — the platform's
  rule is *code first, cloud second*.

## ✍️ Related writing

[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager)
