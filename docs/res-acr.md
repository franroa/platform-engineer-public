# 📦 Container Registry (ACR)

> 💡 **TL;DR** — the platform's **single image source**: CI pushes here, every cluster pulls
> from here — over private networking, authenticated by managed identity. If it's not in the
> registry, it doesn't run.

| Property | Value |
| --- | --- |
| **Scope** | platform (shared; geo-replicated to regions) |
| **Created by** | platform terraform (`up-modules` registry module) |
| **Consumed by** | all clusters (pull) · CI runners (push) |

## 🧠 The concept
A private OCI registry is the chokepoint where supply-chain control becomes possible: one
place to scan, sign, retag and retain images. The moment images can come from "anywhere",
provenance is gone. Registry design = auth model (identities, not passwords) + network model
(private endpoints) + replication model (pull locally in every region).

## 🏗️ How it's used in this platform
- CI (in `up-gitlab` runners) builds and pushes; clusters pull via their **kubelet managed
  identity** — no `imagePullSecrets` anywhere.
- Reachable through [private endpoints](res-private-endpoint.md); public access off.
- Geo-replication keeps pulls **in-region** (fast node scale-up, no cross-region egress).

## ⚙️ Lifecycle & change
Registry config is platform terraform; retention/cleanup policies are code. Image lifecycle
(tags, scanning) belongs to the CI components (`up-ci-components`).

## ✅ Best practices we apply
- Pull by **digest** (or immutable tags) for anything production — `latest` is not a version.
- Retention policies on untagged manifests — registries grow forever otherwise.
- Scan on push; block deploys on critical findings via the pipeline, not manually.

## ⚠️ Gotchas
- Managed-identity pull needs the role assignment on the registry — a missing `AcrPull` looks
  like `ImagePullBackOff` with an unhelpful 401.
- Geo-replication replicates *images*, not *webhooks/config* — region-specific settings stay per-replica.

## 🔗 Related
[AKS](res-aks.md) · [Private Endpoint](res-private-endpoint.md) ·
[gitlab-components](gitlab-components.md) · [gitlab-runners](gitlab-runners.md)

---
**Repo (map alias):** `up-modules` (module) · consumed platform-wide.
