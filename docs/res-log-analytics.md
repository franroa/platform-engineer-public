# 🔭 Log Analytics

> 💡 **TL;DR** — the **regional evidence store**: platform diagnostics (gateway, firewall,
> vault audits, flow logs) land in a per-region workspace, queryable with KQL. The
> app-observability stack (Grafana/Loki/Mimir) rides *alongside* it — see
> [observability](observability.md).

| Property | Value |
| --- | --- |
| **Scope** | region (one workspace per region) |
| **Created by** | platform terraform (`up-observability` core) |
| **Fed by** | diagnostic settings on gateways, firewalls, vaults, NSG flow logs, AKS |

## 🧠 The concept
Azure resources emit *platform telemetry* (control-plane logs, audits, flows) only if a
**diagnostic setting** routes it somewhere. A regional workspace is that somewhere: retention
policies, RBAC-scoped access, and KQL over everything. Rule of thumb: **Azure-resource
evidence → Log Analytics; application telemetry → the LGTM stack.** Both exist on purpose.

## 🏗️ How it's used in this platform
- Diagnostic settings are part of every module — a resource without them fails review.
- Security-relevant streams (VPN sign-ins, firewall hits, [Key Vault](res-key-vault.md)
  reads, [NSG](res-nsg.md) flow logs) are the incident-response substrate.
- Access is read-scoped by role (`monitor_reader`-style grants appear in the live security
  inventory).

## ✅ Best practices we apply
- Per-region workspaces (data sovereignty + blast radius), consistent table retention.
- Alert on *absence* too — a silent firewall log is a broken pipeline, not peace.
- Cost hygiene: cap verbose categories, archive-to-storage for long retention.

## ⚠️ Gotchas
- Ingestion pricing is per-GB — one chatty diagnostic category can dominate the bill.
- KQL ≠ PromQL/LogQL: two query cultures in one platform is intentional, document which
  evidence lives where.
- Diagnostic settings are per-resource — "we forgot to wire it" is only visible when you
  need the logs. Automate via modules (we do).

## 🔗 Related
[observability](observability.md) · [Key Vault](res-key-vault.md) · [NSG](res-nsg.md) ·
[VPN Gateway](res-vpn-gateway.md)

---
**Repo (map alias):** `up-observability` · modules wire diagnostics everywhere.
