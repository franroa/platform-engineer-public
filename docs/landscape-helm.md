# ⛵ Helm — the packaging grammar

> 💡 **TL;DR** — Helm is the platform's *reuse* grammar for workloads: tenants don't write
> Kubernetes YAML, they compose charts from the shared library (`up-helm-charts`) as
> `Chart.yaml` dependencies. The chart library is one of the
> [three reuse libraries](blog-reuse-libraries), and the golden path is mostly "declare the
> chart, fill the values".

## The job it does here

- **A chart library, not per-app charts.** `web-service`, `postgres-connection`, `worker` —
  small, composable charts a tenant pulls in as dependencies. An app's own chart is often
  ten lines of `Chart.yaml` and a `values.yaml`.
- **Conventions ride inside.** Labels, probes, resource defaults, network policy hooks and
  the observability annotations all ship IN the library charts — tenants inherit them by
  composing, the same way pipelines inherit the OPA gate.
- **Versioned like code.** Chart bumps are merge requests; [Argo CD](landscape-argocd) rolls
  them out; a bad bump is a revert.

## What I'd tell you before adopting

1. Treat charts as a LIBRARY with semver — per-app snowflake charts recreate the YAML mess
   with extra indirection.
2. Put your defaults in the library chart, not in documentation.
3. Values files are an API: validate them (a JSON schema per chart pays for itself).

## Where it runs

Nowhere — and that is the point. Helm has **no controller in the cluster**: charts are
OCI artifacts in the registry (authored in [`up-helm-charts`](up-helm-charts)) and
[Argo CD](landscape-argocd) renders them server-side. The only Helm "runtime" is the
release inventory Argo maintains.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-helm) — where every OTHER landscape
service runs as a GitOps-delivered workload.

## Related

[Three libraries, one platform](blog-reuse-libraries) · [The golden path](blog-golden-path) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[Argo CD — the cluster state is a repo](landscape-argocd) ·
[External DNS — records follow the routes](landscape-external-dns) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[KEDA — scale on real signals](landscape-keda) ·
[Reloader — rotation that actually reaches pods](landscape-reloader)
