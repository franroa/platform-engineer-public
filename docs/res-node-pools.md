# 🖥️ AKS Node Pools

> 💡 **TL;DR** — node pools are the cluster's **compute segments**: groups of identical VMs
> with their own size, scaling and scheduling rules. We separate *system*, *CI*, and
> *general workload* pools so noisy neighbours can't starve the platform.

| Property | Value |
| --- | --- |
| **Scope** | cluster — per-region sets (see the region picker in the AKS view) |
| **Created by** | `up-nodepools` |
| **IaC type** | `azurerm_kubernetes_cluster_node_pool` |

## 🧠 The concept
One pool per *class of work*, not per team. Pools differ by VM size, autoscaling range,
taints/labels, and QoS expectations. Scheduling is then steered with taints + tolerations
(keep things *out*) and node selectors/affinity (pull things *in*). The pool boundary is
also the failure boundary: a bad rollout that OOMs its nodes takes down its pool, not the
cluster.

## 🏗️ How it's used in this platform
- **system** — platform pods (ingress, cert-manager, observability agents), tainted so tenant
  pods stay off.
- **gitlab** — CI runners (eu01), isolated so pipeline bursts never squeeze production.
- **gen** — general tenant workloads, **Guaranteed QoS** encouraged (requests = limits).
- Pool sets differ per region (eu01 carries the CI pool) — the AKS view's region strip shows
  the real layout per region.

## ⚙️ Lifecycle & change
Sizing/scaling changes are MRs in `up-nodepools` — small, frequent, reviewable. New pool
classes are rare and deliberate (they multiply per region).

## ✅ Best practices we apply
- Taint the system pool; never let workloads land there by accident.
- Autoscale ranges per pool; Guaranteed QoS for anything latency-sensitive.
- Prefer more small pools over one giant pool — better failure isolation and bin-packing.

## ⚠️ Gotchas
- Changing a pool's VM size = node replacement (rolling drain), not an in-place edit.
- Taints without matching tolerations on DaemonSets silently skip nodes (missing agents!).
- Spot pools are fine for CI, never for stateful tenant pods.

## 🔗 Related
[AKS](res-aks.md) · [Namespace](res-namespace.md) · [kubernetes view](kubernetes.md)

---
**Repo (map alias):** `up-nodepools` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[Replace, don't repair — cattle, not pets](blog-replace-dont-repair) ·
[Well-architected is a set of questions, not a badge](blog-well-architected)
