# ☸️ AKS Cluster

> 💡 **TL;DR** — one managed Kubernetes cluster **per sector × stage × region**
> (`k8s-<sector>-<stage>-<region>`). Azure runs the control plane; we own everything from the
> [node pools](res-node-pools.md) up. The API endpoint is **private** — reachable only over
> the [VPN](vpn.md).

| Property | Value |
| --- | --- |
| **Scope** | cluster (one per sector×stage×region) |
| **Created by** | `up-kubernetes` (cluster + in-cluster platform services) |
| **Consumed by** | every tenant [namespace](res-namespace.md) |
| **IaC type** | `azurerm_kubernetes_cluster` |

## 🧠 The concept
AKS splits responsibility: Azure operates the control plane (API server, etcd, scheduler) as
a managed service; you own the worker nodes, networking, and everything scheduled onto them.
The design decisions that matter are *around* the cluster: private or public API, identity
model (workload identity vs secrets), how many clusters vs how many namespaces.

Our answer to the last one: **clusters isolate stages and regions; namespaces isolate
tenants.** Blast radius by cluster, density by namespace.

## 🏗️ How it's used in this platform
- Naming carries the coordinates: `k8s-<sector>-<stage>-<region>` — the live map derives each
  cluster's applications from exactly these names (namespace files in `up-namespaces` declare
  their target clusters).
- **Private API**: no public endpoint; kubectl works over the [VPN](vpn.md) only.
- In-cluster platform services installed by `up-kubernetes`:
  [cert-manager](res-cert-manager.md), [ALB/AGfC + WAF](res-ingress-waf.md), external-dns,
  external-secrets, the policy add-on, observability agents.
- **Workload identity** (OIDC federation): pods exchange service-account tokens for Entra
  identities — no cluster secrets holding Azure credentials.

## ⚙️ Lifecycle & change
Cluster changes flow through `up-kubernetes` (plan → OPA → apply). Node pool sizing lives in
`up-nodepools`. Upgrades are per-cluster, stage-first (sandbox → live), region by region.

## ✅ Best practices we apply
- Private API + VPN; **no** public kubeconfig path.
- System workloads and tenant workloads on **separate node pools**.
- Managed identity everywhere — zero long-lived credentials in the cluster.
- One cluster definition, instantiated per region — no snowflake clusters.

## ⚠️ Gotchas
- The control plane is Azure's — you can't ssh it, tune etcd, or pin its minor version forever.
- Cluster-autoscaler and manual node counts fight; pick one owner for pool size.
- Private API means CI must run **inside** the network (`up-gitlab` runners do).

## 🔗 Related
[Node Pools](res-node-pools.md) · [Namespace](res-namespace.md) ·
[Ingress + WAF](res-ingress-waf.md) · [cert-manager](res-cert-manager.md) ·
[ACR](res-acr.md) · [kubernetes view](kubernetes.md)

---
**Repo (map alias):** `up-kubernetes` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Terraform at scale — scopes, tiers & a policy gate](blog-terraform) ·
[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager)
