# 🚪 NAT Gateway

> 💡 **TL;DR** — the NAT gateway is the **managed exit door**: all *outbound* internet traffic
> from a subnet leaves through one stable, known public IP set. Nothing about it allows
> traffic *in*.

| Property | Value |
| --- | --- |
| **Scope** | region — attached per [subnet](res-subnet.md) |
| **Created by** | `up-network` |
| **IaC type** | `azurerm_nat_gateway` |

## 🧠 The concept
Workloads on private IPs still need to *reach out* (pull images, call APIs). Without explicit
egress, Azure improvises an outbound SNAT that is unpredictable and port-starved. A NAT
gateway replaces that with a purpose-built, elastic SNAT service: predictable source IPs,
~64k ports per IP, no inbound exposure ever.

**Egress ≠ ingress.** The NAT gateway is one-way glass: your workloads see the internet,
the internet sees nothing.

## 🏗️ How it's used in this platform
- Attached to the workload subnets so cluster egress (image pulls, webhooks, external APIs)
  leaves via **known IPs** — which partners can allow-list.
- Pairs with the hub firewall: NAT answers *"from which IP do we leave?"*, the firewall
  answers *"what are we allowed to reach?"*.

## ⚙️ Lifecycle & change
Defined with the network tiers in `up-network`. Changing egress IPs is a controlled
event (partners may pin them) — treat the public IP prefix as an API you've published.

## ✅ Best practices we apply
- Use a **public IP prefix** (not loose IPs) so the egress range is compact and documentable.
- Watch **SNAT port utilisation** — exhaustion looks like random outbound timeouts.
- Never rely on Azure's *default* outbound access; it's being retired and was never yours.

## ⚠️ Gotchas
- NAT gateway wins over other outbound methods on the subnet — attaching it *changes* your
  egress IP instantly.
- It's zonal: plan per-zone if you need zone-isolated egress.
- It does **not** apply to traffic that stays on private paths (peering, private endpoints).

## 🔗 Related
[Subnet](res-subnet.md) · [VNet](res-vnet.md) · [network-hub-spoke](network-hub-spoke.md)

---
**Repo (map alias):** `up-network` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Load balancing — L4 moves connections, L7 makes decisions](blog-load-balancing)
