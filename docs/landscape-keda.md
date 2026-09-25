# 📈 KEDA — scale on real signals

> 💡 **TL;DR** — CPU is a lagging, lying signal for most tenant workloads; KEDA scales on
> what actually queues the work: service-bus depth, event streams, HTTP concurrency, cron
> windows — including **to zero** for the workers that only sometimes work.

## The job it does here

- **`ScaledObject` in the worker chart**: the [library `worker` chart](landscape-helm)
  exposes "what queue drives you" as values; tenants declare the trigger, KEDA owns the HPA.
- **Scale-to-zero for burst workers** — analytics and import jobs cost nothing between
  bursts; the platform's [cost-aware bias](blog-golden-path) applied to compute.
- **Workload identity for scalers**: trigger auth uses federated identity to read queue
  metrics — [no connection strings in manifests](blog-access-as-code).

## What I'd tell you before adopting

1. Pick the metric that *causes* work (lag, depth), not one that correlates with it.
2. Set `minReplicaCount` consciously — zero is a feature AND a cold-start bill.
3. KEDA replaces your HPA definition, not your resource requests — right-size pods first.

## Where it runs

`ns: keda` · every cluster (`platform-services/base/`) · sync wave −1 · chart `keda 2.16.1`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: ScaledObjects on queues/streams for every tenant, including scale-to-zero.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-keda)

## Related

[Multi-tenant Kubernetes](blog-kubernetes) · [The golden path](blog-golden-path) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[Helm — the packaging grammar](landscape-helm) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Karpenter — just-in-time, right-sized nodes](landscape-karpenter)
