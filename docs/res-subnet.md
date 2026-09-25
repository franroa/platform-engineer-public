# 🧩 Subnet

> 💡 **TL;DR** — the subnet is the **unit of network policy**. VNets hold the address space;
> subnets decide *who sits together* and *what rules apply to them* ([NSGs](res-nsg.md),
> routes, delegations). Every NIC in the platform lands in exactly one.

| Property | Value |
| --- | --- |
| **Scope** | region (defined with its [VNet](res-vnet.md)) |
| **Created by** | `up-network` — one terraform file **per subnet** (`subnet.<name>.tf`) |
| **Consumed by** | AKS node pools, gateways, private endpoints, resolvers |
| **IaC type** | `azurerm_subnet` |

## 🧠 The concept
A subnet is an address-space slice of a VNet with three superpowers attached:
1. **Security** — an [NSG](res-nsg.md) binds per subnet: the allow/deny rulebook.
2. **Routing** — route tables override default routing per subnet (e.g. force traffic
   through a firewall).
3. **Delegation / special roles** — some Azure services demand a dedicated, sometimes
   *named* subnet: `GatewaySubnet` (VPN), `AzureBastionSubnet`, resolver inbound/outbound.

Because policy binds at subnet level, subnet layout **is** your segmentation model: things
that share a subnet share a fate.

## 🏗️ How it's used in this platform
- **Hub subnets are infrastructure roles**: gateway, bastion, firewall (+ its management
  subnet) and the DNS resolver pair (inbound/outbound). One file each in `up-network`
  makes every subnet an explicit, reviewable unit — the live map reads exactly these files
  (the region view's *SUBNETS · live from code* strip).
- **Spoke subnets are workload placement**: node pools, [private endpoints](res-private-endpoint.md)
  and data services get their own subnets, each with a default-deny NSG.
- Click **Subnets** in any region diagram to see the live list, straight from the code.

## ⚙️ Lifecycle & change
Adding a subnet = adding one `subnet.<name>.tf` file (address range from the plan in
`up-config`) + its NSG. The pipeline applies it in the network tiers; the live map picks
it up on the next sync — no map edit needed.

## ✅ Best practices we apply
- **Size generously up front** — resizing a live subnet is disruptive (drain, resize, refill).
- **Dedicated subnets per concern** — nodes ≠ endpoints ≠ gateways. Never share `GatewaySubnet`.
- **Default-deny NSG per workload subnet**; every opening is a reviewed rule with a comment.
- One file per subnet keeps diffs small and ownership obvious.

## ⚠️ Gotchas
- Some subnets are *magic names* (`GatewaySubnet`, `AzureBastionSubnet`) — Azure refuses the
  service if the name is wrong, and NSGs on them are restricted.
- Azure reserves 5 IPs in every subnet — a /29 sounds like 8 addresses but is 3.
- Deleting a subnet requires it to be truly empty — hidden NICs (endpoints!) block it.

## 🔗 Related
[VNet](res-vnet.md) · [NSG](res-nsg.md) · [NAT Gateway](res-nat-gateway.md) ·
[Private Endpoint](res-private-endpoint.md) · [network-hub-spoke](network-hub-spoke.md)

---
**Repo (map alias):** `up-network` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Terraform at scale — scopes, tiers & a policy gate](blog-terraform)
