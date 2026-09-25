# Observability — the ambient layer

> Repos: `up-observability`, `observability/up-grafana-tf-*`, `up-grafana`, `up-grafana-tenants`, `otel-*`, `up-pagerduty`

Observability isn't a stage in the delivery spine — it's **ambient**: it wraps every layer, watching the network, the clusters, the tenants and the pipelines. It's rendered in the scene as scanning probes rather than a block, because it touches everything.

## What's in it

- **Metrics & logs** on Grafana's stack — **Mimir** (metrics) and **Loki** (logs) run in-cluster, provisioned as Terraform.
- **Grafana as code** — `up-grafana-tf-*` modules define dashboards and data sources per area (platform, SaaS, data-engineering, IT, ml…). Dashboards are reviewed in merge requests, not clicked together.
- **Per-tenant projections** — `up-grafana-tenants` gives tenants scoped visibility into their own slice.
- **Alerting / on-call** — `up-pagerduty` wires routing and escalation as code.
- **Tracing** — OpenTelemetry pipelines (the `otel-*` work) for distributed traces.
- **Flow logs** — network-level observability from the hub/spoke flow-log infrastructure.

## The plan-time CRD rule (again)

Like `up-crds`, the **Mimir** and **Loki** modules extract CRD YAML from Helm chart packages, which must exist on disk **before** `terraform plan`. So they **must** be driven via `task plan` / `task apply` — raw `terraform` produces incomplete or incorrect plans.

## Why observability as code?

- **Reproducible & reviewable.** A dashboard or alert change is a diff, not a memory. You can roll it back.
- **Consistent per environment.** The same modules render dashboards for every tier/region, so sandbox looks like live.
- **Scoped by tenancy.** Teams see their own data through the same tenancy model the rest of the platform uses.

## Pseudocode: dashboards as code

```
for area in [platform, saas, data_eng, it, ml]:
    datasource = grafana_datasource(mimir_url, loki_url)
    for dash in load_json("dashboards/{area}/*.json"):
        grafana_dashboard(folder = area, definition = dash, source = datasource)
pagerduty_route(service = area, escalation = on_call_policy(area))
```

## ✍️ Related writing

[Migrating observability: on-premises → Grafana Cloud](blog-grafana-cloud-migration) ·
[You can't SSH into production — that's the feature](blog-immutability) ·
[Instrumentation as a platform default — the OpenTelemetry Operator](blog-otel-operator) ·
[SLOs and error budgets — turning "is it up?" into a number you can spend](blog-slo-error-budgets) ·
[Twelve-Factor isn't a checklist — it's what the platform makes free](blog-twelve-factor)
