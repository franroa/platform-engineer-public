# 🏷️ Namespace

> 💡 **TL;DR** — the namespace is the **tenant's flat in the shared building**: the boundary
> for RBAC, quotas, network policy and naming inside a cluster. In this platform namespaces
> are **declared as files** — one YAML per app per stage, stating which clusters it runs in.

| Property | Value |
| --- | --- |
| **Scope** | tenant (inside a [cluster](res-aks.md)) |
| **Created by** | `up-namespaces` — `namespaces/<app>-<stage>.yml` |
| **IaC type** | K8s `v1/Namespace` + platform wrapping (quota, RBAC, policies) |

## 🧠 The concept
Kubernetes multi-tenancy is namespace-shaped: RBAC roles bind per namespace, ResourceQuotas
cap per namespace, NetworkPolicies default-deny per namespace. A namespace without those
attachments is just a name prefix — the platform's job is to make "namespace" *mean*
"isolated, budgeted, policy-enforced cell".

## 🏗️ How it's used in this platform
- **One file per app×stage** in `up-namespaces` (e.g. an app's `-dev`, `-stg`, `-prod`
  files), each declaring its **tenant** and its **target clusters**
  (`k8s-<sector>-<stage>-<region>` list).
- The live map reads these files directly: the AKS view shows each region's *real*
  namespaces — an app appears only in the clusters its file targets.
- Suffix convention colours the map: `-prod`/`-live` green · `-stg`/`-tra` amber · `-dev` blue.
- Tenant membership/permissions attach via `up-tenants` (default) and
  `up-identity` (extended) — see [tenants](tenants.md).

## ⚙️ Lifecycle & change
Adding an app to a cluster = one MR adding/editing its namespace file (clusters list). The
platform reconciles namespace + quota + RBAC + policies from it. Deleting the file retires
the namespace.

## ✅ Best practices we apply
- Namespaces are **cattle records**: files in git, never `kubectl create namespace`.
- Default-deny NetworkPolicy and a ResourceQuota land with every namespace.
- Naming carries meaning (`<app>-<stage>`) — tooling and the map depend on it.

## ⚠️ Gotchas
- Deleting a namespace deletes **everything in it** — treat file removal as a decommission.
- Cluster-scoped resources (CRDs, ClusterRoles) don't belong to any namespace — those stay
  platform-owned.

## 🔗 Related
[AKS](res-aks.md) · [Resource Group](res-resource-group.md) · [tenants](tenants.md) ·
[Helm Release](res-helm-release.md)

---
**Repo (map alias):** `up-namespaces` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[Instrumentation as a platform default — the OpenTelemetry Operator](blog-otel-operator) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform)
