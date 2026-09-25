# 🔌 Private Endpoint

> 💡 **TL;DR** — a private endpoint gives a PaaS service (Key Vault, Storage, PostgreSQL…) a
> **NIC inside our VNet**: the service stops being "somewhere on the internet" and becomes a
> private IP in a subnet we control. It is *the* mechanism behind "private by default".

| Property | Value |
| --- | --- |
| **Scope** | tenant×region — one per service instance needing private reach |
| **Created by** | terraform modules (`up-modules`) wherever the service is created |
| **IaC type** | `azurerm_private_endpoint` |

## 🧠 The concept
PaaS services natively expose public FQDNs. A private endpoint projects the service into
your network: a NIC with a private IP lands in a [subnet](res-subnet.md), and traffic to the
service travels the Azure backbone — never the public internet. Combined with
[private DNS](res-private-dns.md) (so the name resolves to that IP) and the service's public
access switched off, the service is unreachable from outside the peered network — the
[VPN](vpn.md) becomes the only human path in.

## 🏗️ How it's used in this platform
- Data services ([Key Vault](res-key-vault.md), [Storage](res-storage-account.md),
  [PostgreSQL](res-postgresql.md), [ACR](res-acr.md)) are reachable **only** via private
  endpoints in dedicated endpoint subnets.
- The live security inventory lists every `azurerm_private_endpoint` in the group's code —
  the map's region view shows them at the region tier.
- Endpoint + zone-group registration is baked into the terraform modules, so consuming teams
  get private-by-default without thinking about it.

## ⚙️ Lifecycle & change
Created with the service by its module; destroyed with it. The subnet must exist first
(network tiers) — which is why endpoint subnets are part of the standing network, not of
app deploys.

## ✅ Best practices we apply
- **Disable public network access** on the service — an endpoint *plus* an open public door
  is theatre.
- Register DNS via **zone groups**, never manual records.
- Dedicated endpoint subnets; NSG them like any workload subnet.

## ⚠️ Gotchas
- An endpoint NIC blocks subnet deletion — "empty" subnets often aren't.
- Each sub-resource (e.g. storage `blob` vs `dfs` vs `table`) needs its **own** endpoint.
- Cross-region: endpoints are regional; a service consumed from two regions needs DNS design,
  not two hostnames.

## 🔗 Related
[Private DNS](res-private-dns.md) · [Subnet](res-subnet.md) · [Key Vault](res-key-vault.md) ·
[Storage](res-storage-account.md) · [PostgreSQL](res-postgresql.md)

---
**Repo (map alias):** `up-modules` (created per service) · network: `up-network`.

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes)
