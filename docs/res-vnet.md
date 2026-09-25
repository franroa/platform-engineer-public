# 🕸️ Virtual Network (VNet)

> 💡 **TL;DR** — the VNet is the *container of all connectivity*: a private, isolated address
> space in one region. Nothing talks to anything unless both ends live in (or are peered into)
> a VNet. Ours follow a strict **hub-and-spoke** shape — see [network-hub-spoke](network-hub-spoke.md).

| Property | Value |
| --- | --- |
| **Scope** | region (one hub per region · one spoke per subscription×region) |
| **Created by** | `up-network` (terraform, tiered deploy) |
| **Consumed by** | every workload NIC, [AKS](res-aks.md), [private endpoints](res-private-endpoint.md) |
| **IaC type** | `azurerm_virtual_network` |

## 🧠 The concept
A VNet is Azure's software-defined network: an RFC1918 address block you own, carved into
[subnets](res-subnet.md), invisible from the internet unless you explicitly open a door.
Two properties drive every design decision:

- **Peering is non-transitive.** If A↔B and B↔C are peered, A still cannot reach C. This is
  *why* hub-and-spoke exists: make the hub the B in every pair, and it becomes the only
  routing waypoint — one place to inspect, log and gate traffic.
- **Address space is forever.** Overlapping CIDRs can never be peered; renumbering a live
  VNet is a rebuild. Address planning is therefore *config*, not code (see below).

## 🏗️ How it's used in this platform
- **One hub VNet per region** (eu01 · us01 · us02 · ca01), each on its own non-overlapping
  block. The hub carries only *infrastructure*: GatewaySubnet, bastion, firewall, DNS resolver.
- **One spoke VNet per subscription×region** — `ultracore-live`, `ultracore-sandbox`, `ultraapps-live`,
  `ultraapps-sandbox` — holding the actual workloads (AKS nodes, data services, endpoints).
- **CIDRs come from `up-config`** (`network.yml`): a single source-of-truth file allocates
  every block, so regions and tiers can never collide.
- **Spokes are discovered, not registered:** the hub module finds spokes via data sources and
  peers them automatically — adding a spoke never edits the hub by hand.

## ⚙️ Lifecycle & change
VNets are created in the `spoke` and `hub` tiers of the network deploy order
(`… → subscription → spoke → dns → hub → flowlogs → peering`). A change is a merge request in
`up-network`; the pipeline runs plan → **OPA gate** → apply. Deleting or renumbering a
VNet is treated as a rebuild and protected accordingly.

## ✅ Best practices we apply
- Plan the whole address space **up front**, in one file, before the first VNet exists.
- Keep the hub *thin* — infrastructure only; workloads always live in spokes.
- Peer through the hub only; never spoke↔spoke (it silently bypasses inspection).
- Flow logs on, shipped to [Log Analytics](res-log-analytics.md).

## ⚠️ Gotchas
- Peering both directions is required — one-way peering looks connected in one console and
  broken in the other.
- A VNet is regional: "multi-region VNet" doesn't exist; cross-region = hub↔hub peering.
- DNS doesn't follow peering automatically — that's what [Private DNS](res-private-dns.md)
  links are for.

## 🔗 Related
[network-hub-spoke](network-hub-spoke.md) · [Subnet](res-subnet.md) · [NSG](res-nsg.md) ·
[VPN Gateway](res-vpn-gateway.md) · [Private Endpoint](res-private-endpoint.md) ·
[Private DNS](res-private-dns.md) · [NAT Gateway](res-nat-gateway.md)

---
**Repo (map alias):** `up-network` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Terraform at scale — scopes, tiers & a policy gate](blog-terraform)
