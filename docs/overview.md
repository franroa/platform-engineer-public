# Platform Architecture — Overview

Nimbus's platform (internally **Ultraplatform**) is an **Infrastructure-as-Code + GitLab-CI + Azure** internal developer platform. Everything is Terraform, deployed through GitLab pipelines, onto a **hub-and-spoke** Azure network, under a single identity and policy envelope.

## The mental model: three envelopes around a delivery spine

Rather than a flat list of repos, the platform is best read as **three concentric governance envelopes** wrapping a **vertical delivery spine**:

| Envelope (outer → inner) | Owns | Repos |
|---|---|---|
| **Identity & Access** | Who can do what, and only when they need it | `up-bootstrap`, `up-identity`, `up-tenants` |
| **Network Perimeter** | The only ways in and out | `up-network`, `up-vpn` |
| **Security & Governance** | Every change is checked before it lands | `development/up-ci-toolkit` (OPA), `up-policies`, `up-waf`, `up-security-policies`, `up-guardrails` |

Inside those envelopes, the **delivery spine** is the ordered set of things you actually deploy:

```
Config → Network → VPN → Kubernetes → GitLab/Runners → Tenants → Workloads & AI
```

## Why this shape?

- **One source of truth.** `up-config` publishes `org.yml`, `network.yml`, `subscriptions.yml` as Terraform remote-state outputs. Every other module consumes them — no duplicated CIDRs, subscription IDs or region maps.
- **Dependency order is explicit.** `up-network` documents an 8-tier deploy order (foundation → DNS → subscriptions → spokes → DNS → hub → flowlogs → peering). The spine mirrors that.
- **Sectors × tiers × regions.** Everything is parameterised by `SECTOR` (platform / nimbus), `TIER` (sandbox / live) and `REGION` (eu01 / us01). The same modules render every environment.
- **Least privilege by construction.** Humans get **time-limited PIM** activation; only service accounts (operators) hold standing access.

## How to read the 3D scene

- The **solid stack** in the centre is the delivery spine, bottom = foundation.
- The **translucent nested cages** are the three envelopes — Identity outside, Network in the middle, Security inside.
- The **hub node with spokes** is the hub-and-spoke network and its single VPN door.

Use the menu on the left to focus any part and read the concept behind it.

## ✍️ Related writing

[An AI layer for a developer platform](blog-ai-platform) ·
[Well-architected is a set of questions, not a badge](blog-well-architected) ·
[Backstage — the developer portal](landscape-backstage)
