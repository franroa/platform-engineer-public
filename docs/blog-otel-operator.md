# 🔭 Instrumentation as a platform default — the OpenTelemetry Operator

> 💡 **TL;DR** — a design note, not a war story: the next evolution of this platform's
> [observability layer](observability) is the **OpenTelemetry Operator** — collectors and
> auto-instrumentation declared as Kubernetes CRDs, so telemetry becomes something a tenant
> *inherits from its namespace* rather than something every app team wires by hand. The
> platform ships Grafana, Loki and Mimir as defaults today; this closes the last manual gap:
> getting well-formed traces and metrics *out of the apps*.

## 1 · The gap: the backend is platform, the instrumentation isn't

Metrics, logs and dashboards ship with the platform — agents on the clusters, one Grafana per
sector, tenant projections handled in `up-grafana-tenants`. But *tracing* still depends on each
app team importing an SDK, configuring an exporter, and agreeing on sampling. That's exactly
the copy-paste failure mode the [three libraries](blog-reuse-libraries) exist to kill —
telemetry config is infrastructure pretending to be app code.

## 2 · The operator turns telemetry into CRDs

The OpenTelemetry Operator manages two custom resources, and both map cleanly onto the
platform's existing grammar:

- **`OpenTelemetryCollector`** — a managed collector deployment. Scope question, as always
  ([scopes](scopes)): a **gateway collector per region** (batching, tail sampling, export to
  the backends) and **agent collectors per node** — platform-owned, like cert-manager or the
  ingress controller ([kubernetes](kubernetes)).
- **`Instrumentation`** — the interesting one. A namespace-scoped resource declaring *how to
  auto-instrument*: language SDKs, sampler, propagators, exporter endpoint. A pod annotation
  (`instrumentation.opentelemetry.io/inject-python: "true"`) and the operator injects the SDK
  at admission — **no code change, no library import, no per-app exporter config**.

## 3 · Where it lands in this platform

The fit is what makes it attractive — every piece already has a home:

- The **operator and gateway collectors** are cluster services → `up-kubernetes`, deployed
  like every other platform service.
- The **`Instrumentation` resource is per tenant namespace** → declared next to the namespace
  itself in `up-namespaces`, so a tenant gets working traces the moment its namespace exists.
- **Collector charts** join the chart library (`up-helm-charts`); config lands in
  [Config](res-namespace) like everything else.
- The **OTLP endpoint becomes a platform contract**: apps that *do* want manual
  instrumentation get one stable URL per namespace, and the collector — not forty apps —
  decides sampling, redaction and routing.

## 4 · Honest caveats, before it exists

This is the design I'd defend, written down *before* the rollout — worth stating what's
unproven here: auto-instrumentation quality varies by language (excellent for Python/Java,
thinner elsewhere); admission-time injection adds a failure mode that needs the same care as
any mutating webhook; and tail sampling at the gateway needs sizing against real traffic, not
hope. The pattern's promise is the platform's promise in miniature — **defaults you inherit,
not steps you follow** — but it earns that only if the injected SDK is boring and the
collector never becomes the outage.

## Related

[Observability](observability) · [Multi-tenant Kubernetes](kubernetes) ·
[Three libraries, one platform](blog-reuse-libraries) · [Build & scopes](scopes) ·
[✍️ all articles](blog-index)
