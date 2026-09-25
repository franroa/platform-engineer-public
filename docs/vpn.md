# 🚪 VPN — the single door, in detail

> 💡 **TL;DR** — exactly **one** human path into the platform: a Point-to-Site VPN gateway in
> the eu01 hub, OpenVPN over TLS, authenticated by **Entra ID**. Hub-and-spoke peering makes
> that one tunnel reach every spoke in every region. No per-region gateways, no shared keys,
> no public cluster APIs.

| Property | Value |
| --- | --- |
| **Repo (map alias)** | `up-vpn` |
| **Protocol** | OpenVPN (SSL/TLS on 443 — survives hotel/corp firewalls) |
| **Auth** | Microsoft Entra ID — SSO · MFA · Conditional Access |
| **Client pool** | small private `/26` (operators, not a data plane) |
| **Placement** | eu01 hub `GatewaySubnet` — the **only** gateway in the platform |

## 🧠 The mental model

Three access models exist for private infrastructure:

1. **Public endpoints + allow-lists** — simple, but every service is one misconfigured rule
   away from the internet.
2. **Bastion/jump hosts** — private, but shell-shaped: awkward for kubectl/psql/UI tooling.
3. **P2S VPN** — your workstation *joins the network* under your corporate identity.

We chose (3) and made everything else **private by default**: the [AKS](res-aks.md) API,
[Key Vault](res-key-vault.md), [Storage](res-storage-account.md),
[PostgreSQL](res-postgresql.md) — all behind [private endpoints](res-private-endpoint.md).
The VPN is not *a* way in; it is *the* way in.

## 🔄 The connection flow

```
① You start the Azure VPN Client (profile imported once)
② OpenVPN tunnel to hub-eu01 gateway (TLS 443)
③ Entra ID sign-in — SSO + MFA + Conditional Access evaluated
④ Client gets an IP from the /26 pool + routes to the peered space
⑤ hub-eu01 peering fans out: spokes eu01 · hub↔hub → us01 · us02 · ca01
⑥ Hub DNS resolver answers private zones → private endpoints resolve correctly
```

Step ⑥ matters as much as ①–⑤: without the hub [resolver](res-private-dns.md) inbound
endpoint, you could *route* to a private endpoint but never *resolve* its name — the classic
"VPN is up but nothing works".

## 🔑 Why Entra ID (and not certificates or PSKs)

- **Identity-tied**: the tunnel belongs to a *person*, evaluated by Conditional Access
  (MFA, compliant device) at connect time.
- **Instantly revocable**: disable the user, the access dies — no certificate hunting,
  no re-keying shared secrets.
- **One access model**: the same Entra/PIM story as the Azure portal and the cluster —
  see [identity-pim](identity-pim.md).
- **Auditable**: every sign-in is an Entra log event, shipped to
  [Log Analytics](res-log-analytics.md), alertable.

## 🌍 Why only ONE gateway (eu01)

| Per-region gateways | Single gateway + peering |
| --- | --- |
| 4× cost (gateways are expensive) | 1× |
| 4 doors to secure, patch, audit | 1 door |
| 4 client profiles, user confusion | 1 profile |
| revocation touches 4 systems | 1 Entra identity |

The trade-off: eu01 is on the path to remote regions (extra hub↔hub hop, and a dependency on
eu01's hub availability for *operator* access). Accepted: this is an admin path, not a data
plane — workloads and CI never traverse the VPN.

## 🚫 What the VPN is NOT

- **Not for CI/CD** — runners live *inside* the network (`up-gitlab`) and authenticate via
  federated OIDC; pipelines never need a tunnel.
- **Not for service-to-service traffic** — that's peering + private endpoints.
- **Not a general remote-work VPN** — the client pool is deliberately small; it admits
  operators to *this* platform, nothing else.

## 🛠️ Operations

- **Grant/revoke** = Entra group membership (extended access via PIM, see
  [identity-pim](identity-pim.md)). The gateway config itself almost never changes.
- **Protected**: `prevent_destroy` on the gateway — deleting it would sever all operator
  access; it is treated like the root of a tree.
- **Monitor**: P2S connection count, gateway health, and Entra sign-in anomalies.

## 🧰 Troubleshooting map

| Symptom | Usual cause |
| --- | --- |
| tunnel up, names don't resolve | missing private-DNS link, or resolver subnet issue |
| tunnel up, name resolves, timeout | firewall `vpn` rule tier doesn't allow that path |
| can reach eu01, not us01 | hub↔hub peering or remote-region firewall path |
| sign-in loop at connect | Conditional Access (device compliance / MFA) |
| worked yesterday, not today | Entra access revoked/expired — check group/PIM |

## 🔗 Related
[VPN Gateway (resource)](res-vpn-gateway.md) · [network-hub-spoke](network-hub-spoke.md) ·
[Private DNS](res-private-dns.md) · [Private Endpoint](res-private-endpoint.md) ·
[identity-pim](identity-pim.md)

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[External DNS — records follow the routes](landscape-external-dns)
