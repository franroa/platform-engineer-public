# ☁️📊 Grafana Cloud as the observability backend

> 💡 **TL;DR** — the platform's observability backend is **Grafana Cloud**: hosted
> Grafana + Mimir + Loki + Tempo, fed by [OpenTelemetry](landscape-opentelemetry)
> collectors and Alloy agents the platform still owns. We operate the *pipeline* — the
> collection, enrichment, tenancy and dashboards-as-code — and pay someone else to be
> on-call for the storage engines. That trade is the whole point.

## 1 · What we kept, what we handed over

The split matters more than the vendor: everything that encodes OUR decisions stays in the
platform repos — collector configs, [per-tenant Grafana orgs and folders](blog-kubernetes),
dashboards and alert rules as code, the labels that make multi-tenancy real. What left is
the part with no differentiation: running Mimir compactors, Loki index gateways and object
storage lifecycle at 3 a.m. Managed observability is only a win if you keep the
*opinionated* half — otherwise you've just bought dashboards.

## 2 · Tenancy and cost are the same problem

Grafana Cloud bills on series, log volume and trace spans — which means the
[enrichment labels](landscape-opentelemetry) that isolate tenants are ALSO the cost model.
Every series carries tenant/region/cluster; usage dashboards group by exactly those labels;
and a tenant's noisy cardinality shows up as *their* line on the cost panel, not a mystery
in the bill. Adaptive metrics (aggregating unused series) bought back roughly a third of
the series count — but only because the label discipline made "unused" measurable.

## 3 · What I'd tell you

1. Keep dashboards/alerts/collector configs in git — the SaaS is a rendering target, not
   the source of truth.
2. Wire the billing labels on day one; retrofitting cardinality discipline is miserable.
3. Private connectivity for the agents ([the hub](network-hub-spoke) does egress) — your
   telemetry path is production infrastructure.

## Related

[Migrating observability from on-premises](blog-grafana-cloud-migration) ·
[OpenTelemetry](landscape-opentelemetry) · [✍️ all articles](blog-index)
