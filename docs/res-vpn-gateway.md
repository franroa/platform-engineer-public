# 🚦 VPN Gateway (Point-to-Site)

> 💡 **TL;DR** — the **one human door** into the platform. A single P2S gateway in the eu01
> hub, authenticated by Entra ID; hub-and-spoke peering extends that one connection to every
> spoke in **every region**. Full story: [vpn](vpn.md).

| Property | Value |
| --- | --- |
| **Scope** | region — exactly one, in the eu01 hub (`GatewaySubnet`) |
| **Created by** | `up-vpn` |
| **IaC type** | `azurerm_virtual_network_gateway` (P2S/OpenVPN) |

## 🧠 The concept
A P2S VPN gateway terminates *per-person* tunnels (vs site-to-site's network↔network).
OpenVPN over TLS 443 traverses hotel/corporate firewalls; **Entra ID** authentication means
the tunnel is tied to an identity (SSO + MFA + Conditional Access), not to a distributed
certificate or shared key. Clients receive an IP from a small private pool and routes to the
peered address space.

## 🏗️ How it's used in this platform
- Lives in the hub's `GatewaySubnet` (see the live subnet strip in the region view).
- **No gateway in us01/us02/ca01** — cross-region hub↔hub peering carries VPN clients there.
  Fewer doors, one audit point, a fraction of the cost.
- What it unlocks: the private [AKS](res-aks.md) API, every
  [private endpoint](res-private-endpoint.md), and private-name resolution via the hub
  [resolver](res-private-dns.md).

## ⚙️ Lifecycle & change
Owned by `up-vpn`; `prevent_destroy` guards it as critical infrastructure. Access is
granted/revoked in Entra — the gateway itself rarely changes.

## ✅ Best practices we apply
- Entra auth only — revocation is instant and central; no cert lifecycle to run.
- One gateway per *network*, not per region — reuse via peering.
- Gateway + sign-in diagnostics to [Log Analytics](res-log-analytics.md); alert on anomalies.
- Keep the cluster API private — the VPN must never have a public "shortcut" alternative.

## ⚠️ Gotchas
- `GatewaySubnet` is a magic name and can't host anything else.
- The client pool is deliberately small (operators only) — it is not a data plane.
- Client routes update on reconnect: a network change mid-session needs a reconnect to appear.

## 🔗 Related
[vpn](vpn.md) — the deep dive · [network-hub-spoke](network-hub-spoke.md) ·
[Subnet](res-subnet.md) · [Private DNS](res-private-dns.md)

---
**Repo (map alias):** `up-vpn` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Terraform at scale — scopes, tiers & a policy gate](blog-terraform)

## 🔗 Related concepts
The VPN is one of the two doors drawn on the globe — the *operator* door into the
[hub-and-spoke network](network-hub-spoke.md). The other door is desired state:
[Argo CD](landscape-argocd.md) pulling from Git. AI traffic takes neither — it goes
through the [API Management gateway](res-apim.md) instead.
