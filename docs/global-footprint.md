# Global footprint — regions, cross-region hub-and-spoke, and the two doors in

The **Globe** view answers a different question than the stacked/nested views:
not *"what is the platform made of"* but *"where does it run, and how do you get in"*.

## Regions as coloured areas

The platform is deployed to **four Azure regions**, drawn as glowing patches on the globe:

| Region | Role | Notes |
| --- | --- | --- |
| **eu01** | Primary hub | Hosts the single **P2S VPN gateway** (the one door in). |
| **us01** | Peered region | No local gateway — reached **through eu01** via cross-region peering. |
| **us02** | Peered region | Second US region (live stage); peered to eu01 like us01. |
| **ca01** | Peered region | Canada region (live + sandbox stages); peered to eu01. |

Each region shows its **spokes** (live / sandbox) clustered around the regional **hub VNet**.
Every spoke peers only to its hub; spokes never peer to each other.

## Cross-region hub-and-spoke

The two regional **hubs peer to each other** (the great-circle arc between eu01 and us01).
This is hub-and-spoke *at two scales*:

- **Inside a region** — spokes ↔ hub.
- **Across regions** — hub ↔ hub (cross-subscription, cross-region peering).

So a workload in a us01 spoke can be reached from eu01 without ever exposing a public
endpoint: traffic rides spoke → us01 hub → (peering) → eu01 hub, and the VPN client that
landed in eu01 can already see it.

## Drill into a region

**Click a region on the globe** to **zoom into that spot** — staying on the globe — and reveal
its **Azure resources in place**: the **AKS cluster** (+ node pools) at the centre, ringed by the
region's **VNet** (hub + spokes), **Log Analytics**, **VPN Gateway** (eu01), **Container
Registry**, and the tenant-region **Key Vault**, **Storage Account** and **PostgreSQL** — each
chip tagged with its scope. **← Globe** zooms back out.

For the full architecture diagram of a region (the cluster→tenant→app spine with both inbound
doors and every link), open **Region · eu01 / us01 (full diagram)** from the menu. Every region
is the *same shape*:

```
Region (hub VNet)
  └─ AKS Cluster
       └─ Tenant (namespace + resource group)
            └─ App (Deployment · HTTPRoute)
       └─ Key Vault  ← per tenant-region, in a SEPARATE platform-owned RG
```

This is deliberately identical everywhere — a region is a **replica of the same cell**,
so an app is deployed the same way in eu01 and us01.

## Resources and their scope

The region diagram (and the dedicated **Resources & Scopes** view) place every concrete
resource in the **scope** that owns it — because *scope is what decides how many of a thing
exist and who can touch it*:

| Scope | Azure resources | Kubernetes services |
| --- | --- | --- |
| **Region** (subscription) | hub + spoke VNets, DNS · NAT · flow logs, **P2S VPN gateway**, Log Analytics | — |
| **Cluster** (AKS) | Container Registry (platform) | control plane + **node pools**, **ALB / AGfC + WAF** ingress, **cert-manager** |
| **Tenant** | tenant Resource Group | **namespace**, RBAC (AD groups + PIM) |
| **Tenant × Region** | **Key Vault**, **Storage Account**, **PostgreSQL** | — |
| **App** (workload) | DB / secrets (via module) | **Service**, **HTTPRoute**, Helm release |

Two scope rules are load-bearing:

- **A resource is created once per its scope.** A Key Vault is per *tenant-region*, so a tenant
  present in eu01 **and** us01 has **two** Key Vaults — one per region — never one shared.
- **Key Vault and Storage live in a SEPARATE, platform-owned resource group**, *not* the tenant
  RG. The tenant reads secrets and blobs, but cannot delete the vault or the account — the
  blast radius of a tenant mistake stops at their own RG. This is why the diagram draws the
  Key Vault outside the tenant box with a red *"NOT inside tenant RG"* edge.

## Two doors IN — both from outside

The region diagram makes the **two external communications** explicit, because they are the
only ways anything reaches a cluster from outside:

1. **You → VPN → cluster** *(operate)*
   You run the **Azure VPN client** (Point-to-Site, OpenVPN), authenticated by **Entra ID**.
   The P2S gateway lives in **eu01**; from there peering reaches every spoke in every region.
   This is how a human (or `kubectl`) reaches the **private** cluster API and workloads.

2. **Git → Argo CD → app** *(deploy)*
   Deployment is **GitOps**, not a push. **Argo CD** runs *inside* the cluster and **pulls**
   the desired state from Git. Nothing outside holds cluster credentials; Argo reconciles the
   app (the Helm releases / manifests) in-cluster. A change is deployed by **merging to Git**,
   and Argo syncs it into the namespace — the same Git drives **both** regions.

The contrast is the point: **VPN is inbound and interactive** (you reach in), while
**Argo CD is outbound-initiated** (the cluster reaches out to Git and pulls). Neither exposes
the cluster to the public internet.

## Why this shape

- **One door** (P2S + Entra) keeps human access auditable and centrally revocable.
- **GitOps** keeps deploys declarative, reviewable and identical across regions — the cluster
  is the source of *nothing*; Git is the source of truth.
- **Cross-region peering** lets a second region come online as a copy of the first, reachable
  through the same door, without a second VPN gateway to manage.

## ✍️ Related writing

[CAP is a decision you already made — here's where](blog-cap-theorem) ·
[Disaster recovery is a rehearsal, not a binder](blog-disaster-recovery) ·
[Moving a platform between Azure subscriptions](blog-migration-subscriptions) ·
[Well-architected is a set of questions, not a badge](blog-well-architected)
