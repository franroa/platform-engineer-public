# 📖 Private DNS

> 💡 **TL;DR** — private DNS makes private endpoints *usable*: the same hostname that resolves
> to a public IP on the internet resolves to the **private** IP inside our network. Names are
> the seam that makes "private by default" invisible to applications.

| Property | Value |
| --- | --- |
| **Scope** | region/global — zones linked to [VNets](res-vnet.md) |
| **Created by** | `up-network` (zones, links, resolver) |
| **IaC type** | `azurerm_private_dns_zone` + VNet links |

## 🧠 The concept
When a [private endpoint](res-private-endpoint.md) gives a PaaS service a private IP, clients
must *find* it. Azure solves this with **split-horizon DNS**: a private zone (e.g.
`privatelink.postgres.database.azure.com`) overrides the public name *inside* linked VNets
only. Same connection string everywhere; different answer depending on where you ask from.

The second half is the **DNS resolver**: hub inbound/outbound resolver endpoints (each in its
own [subnet](res-subnet.md)) let on-prem/VPN clients resolve private zones, and let Azure
resolve names hosted elsewhere.

## 🏗️ How it's used in this platform
- One private zone **per PaaS service type**, linked to the hub and spokes that need it —
  endpoints register automatically via zone groups.
- The hub hosts the **resolver inbound/outbound subnets** (visible in the live subnet list),
  so [VPN](vpn.md) clients resolve private names exactly like in-cluster workloads do.
- Cluster external-dns writes app records; platform code owns the zones themselves.

## ⚙️ Lifecycle & change
Zones and links live in the network tiers (`dns` before `hub` in the deploy order — the hub
resolver needs the zones). Adding a new PaaS type = new zone + links, one MR.

## ✅ Best practices we apply
- Let **zone groups** register endpoint records — never hand-write privatelink records.
- Link zones to every VNet that must resolve them — a missing link is the classic
  "works in eu01, fails in us01".
- Keep app connection strings on the **public hostname**; split-horizon does the rest.

## ⚠️ Gotchas
- DNS does **not** follow peering — reachability without resolution (or vice versa) is
  always a link/zone problem, not a routing one.
- Records cache: after flipping a service private, stale public answers can linger a TTL.
- One private zone name can exist per VNet link set — plan zone ownership centrally.

## 🔗 Related
[Private Endpoint](res-private-endpoint.md) · [VNet](res-vnet.md) · [vpn](vpn.md) ·
[network-hub-spoke](network-hub-spoke.md)

---
**Repo (map alias):** `up-network` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[DNS is the platform's phone book — and its weakest excuse for an outage](blog-dns) ·
[The OSI model, one layer at a time — and where each one runs here](blog-osi-model) ·
[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager)
