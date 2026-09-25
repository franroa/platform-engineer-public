# 💰 OpenCost — cost allocation, per tenant, per namespace

> 💡 **TL;DR** — [OpenCost](https://www.opencost.io/) (CNCF sandbox) turns the cloud bill into a
> Kubernetes-native metric: cost per namespace, per workload, per tenant — computed from real
> requests/usage against the actual node/spot pricing, not a shared invoice divided by guesswork.
> It's what makes a right-sizing win a number anyone on the platform can *see*, not just a
> claim from a bill.

## The job it does here

- **Cost per tenant, not per subscription.** Shared clusters make the invoice a single number;
  OpenCost attributes it back to namespace/label, so a [tenant's](landscape-index) actual spend
  is visible without needing a separate account per team.
- **Feeds the numbers Karpenter's decisions should be judged against.** Consolidation and
  bin-packing are cost moves — OpenCost is how you confirm they actually worked, not just that
  utilization graphs moved.
- **One pane, not one dashboard per cluster.** Allocation data flows into the same
  [Grafana](landscape-grafana) hub every other telemetry does — cost sits next to latency and
  error rate, not in a separate finance tool nobody on the platform team opens.

## What I'd tell you before adopting

1. Cost allocation is only as good as **requests being honest** — the same prerequisite
   [Karpenter](landscape-karpenter) has. Pods that request nothing get billed as "shared
   overhead," which hides the real offender.
2. Decide the **shared-cost split** (control plane, system pods, idle headroom) up front and
   document it — an undocumented allocation rule is a recurring "why does my namespace cost
   that much" ticket.
3. Treat it as a **read model**, not a gate — cost visibility changes behavior by being seen,
   not by blocking a deploy the way the [OPA gate](security-opa) does.

## Where it runs

`ns: opencost` · every cluster (`platform-services/base/`) · sync wave 0 (reads real
Prometheus metrics, so it lands after [OTel Collector](landscape-opentelemetry)) — pinned in
[`up-kubernetes`](kubernetes) `gitops/platform-services/`. Allocation data is scraped centrally
into the [Grafana](landscape-grafana) hub for the one-pane view.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-opencost)

## Related

[Karpenter — just-in-time, right-sized nodes](landscape-karpenter) ·
[Grafana — one pane, run once](landscape-grafana) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[The cheapest cost review happens before the merge](blog-finops-cost-gates) ·
[Cost governance is three verbs: estimate, meter, standardize](blog-finops-governance) ·
[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Karpenter — just-in-time, right-sized nodes](landscape-karpenter) ·
[OpenFeature — decouple the deploy from the release](landscape-openfeature) ·
[OpenTelemetry — instrument once, everywhere](landscape-opentelemetry) ·
[OPA / rego — infrastructure can't change unless policy says it may](security-opa)
