# 🔭 OpenTelemetry — one instrumentation standard

> 💡 **TL;DR** — the platform standardizes on OTel as *the* telemetry contract: apps speak
> OTLP, collectors own routing/enrichment, and the backend stays swappable. The
> [operator-based design note](blog-otel-operator) describes where this is heading —
> instrumentation as a namespace default tenants inherit, not a library choice they make.

## The job it does here

- **The contract is the protocol**: charts wire `OTEL_EXPORTER_OTLP_ENDPOINT` to a local
  collector; tenants instrument with SDKs, the platform owns everything after the wire.
- **Collectors as the enrichment point**: tenant, region and cluster attributes are stamped
  centrally — the labels the [multi-tenant backend](landscape-index) isolates on, and the
  ones [Grafana Cloud billing cares about](blog-grafana-cloud).
- **Traces first**: the biggest step-change was distributed traces across tenant services —
  metrics/logs correlation hangs off the same IDs.

## What I'd tell you before adopting

1. Standardize the pipeline (collector config) before the SDKs — app teams can vary,
   the wire format can't.
2. Sample at the edge deliberately; unsampled traces are a cost story you'll meet later.
3. Put the collector config in the platform repos — it is infrastructure, not app config.

## Where it runs

`ns: observability` · every cluster (`platform-services/base/`) · sync wave −1 · chart `opentelemetry-collector 0.110.0`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: one collector per cluster (daemonset + gateway); tenants instrument once against OTLP.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-opentelemetry)

## Related

[Instrumentation as a platform default](blog-otel-operator) · [Grafana Cloud](blog-grafana-cloud) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[Grafana Cloud as the observability backend](blog-grafana-cloud) ·
[An internal DevOps assistant is mostly plumbing, and MCP is the pipe](blog-mcp-assistant) ·
[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[OpenCost — cost allocation, per tenant, per namespace](landscape-opencost) ·
[OpenFeature — decouple the deploy from the release](landscape-openfeature)
