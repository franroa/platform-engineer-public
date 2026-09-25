# ⚡ Karpenter — nodes just-in-time, right-sized

> 💡 **TL;DR** — fixed node pools are either wasteful or a bottleneck. [Karpenter](https://karpenter.sh/)
> watches for unschedulable pods and provisions the *right* node in seconds — then consolidates
> and removes it when the work is gone. Capacity follows demand instead of a guess.

## The job it does here

- **Bin-packing over static pools** — instead of pre-sizing a pool per tenant, Karpenter picks
  instance types from the pods' real requests, so [tenant workloads](blog-kubernetes) get exactly
  the shape they ask for.
- **Consolidation** — idle and under-used nodes are drained and replaced with cheaper packing;
  the same [cost-aware bias](blog-golden-path) that KEDA applies to pods, applied to nodes.
- **Provisioner as code** — NodePool/limits live in [`up-kubernetes`](kubernetes), reviewed like
  any other guardrail, so "what can this cluster grow into" is a diff, not a console setting.

## What I'd tell you before adopting

1. Set NodePool **limits** — right-sizing without a ceiling is a right-sized surprise bill.
2. Make workloads honest about requests; Karpenter is only as good as the numbers pods give it.
3. Respect disruption budgets — consolidation moves pods, so PDBs and graceful drain matter.

## Where it runs

`ns: karpenter` · every cluster (`platform-services/base/`) · sync wave −2 · chart `karpenter 0.7.3` (MCR OCI)
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: the provisioner must be watching before the first app pod goes Pending; system pools stay terraform-owned, burst capacity is karpenter-owned.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-karpenter)

## Related

[Multi-tenant Kubernetes](blog-kubernetes) · [KEDA — scale on real signals](landscape-keda) ·
[The golden path](blog-golden-path) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[Replace, don't repair — cattle, not pets](blog-replace-dont-repair) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[KEDA — scale on real signals](landscape-keda) ·
[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus) ·
[OpenCost — cost allocation, per tenant, per namespace](landscape-opencost)
