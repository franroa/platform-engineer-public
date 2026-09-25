# 📊 Grafana — one pane over the telemetry

> 💡 **TL;DR** — [Grafana](https://github.com/grafana/grafana) is the single window over the
> platform's signals: dashboards, alerts and Explore across metrics (Mimir), logs (Loki) and
> traces. Everything is **as code** and **per-tenant**, so a view is a reviewed artifact, not a
> thing someone hand-built and forgot.

## The job it does here

- **Dashboards & alerts as code** — provisioned from the platform repos, so a panel change is a
  merge request with history, not a click in the UI.
- **Per-tenant orgs/folders** — the same [tenancy labels](blog-grafana-cloud) that isolate a
  tenant's telemetry scope its Grafana view and its slice of the cost model.
- **Explore over Mimir + Loki** — one query surface across metrics and logs; the traces come
  from the [OpenTelemetry Operator](landscape-opentelemetry) with no per-app SDK wiring.

## What I'd tell you before adopting

1. Treat dashboards as code from day one — hand-built panels rot and nobody trusts them.
2. Put the tenancy label on every series and log line; it's your isolation *and* your billing.
3. Alert on symptoms users feel (latency, errors), not on every resource that can twitch.

## Where it runs

`ns: observability` · the eu01 hub only (`platform-services/hub/`) · sync wave 0 · chart `grafana 8.8.2`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: ONE pane over Mimir & Loki — regional clusters ship telemetry, they do not each run a dashboard stack.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-grafana)

## If the hub dies

The honest answer to "what happens when eu01 goes down?", since Grafana, [Backstage](landscape-backstage)
and [kpack](landscape-buildpacks) run only there:

- **Nothing user-facing breaks.** Tenant traffic never touches the hub — the
  [gateway](landscape-traefik), routes and sidecars are per-cluster, and each region keeps serving.
- **GitOps keeps reconciling.** Argo CD runs in *every* cluster (`base/`), so deploys and drift
  correction continue everywhere; only **new image builds** (kpack) queue until the hub is back.
- **Telemetry keeps flowing.** Regional collectors ship to the backend directly, not through the
  hub — you lose the *pane*, not the signals. Alert evaluation at the backend keeps paging.
- **Recovery is a bootstrap run, not a restore.** Everything in the hub is declared in
  [`up-kubernetes`](kubernetes) `platform-services/hub/`; promoting another cluster to hub is a
  one-line cluster-class change and a sync.

That trade is deliberate: running the panes once costs one instance; running them per region
triples the cost to protect services whose outage inconveniences engineers, not users.

## Related

[Grafana Cloud as the backend](blog-grafana-cloud) · [OpenTelemetry Operator](landscape-opentelemetry) ·
[Observability migration](blog-grafana-cloud-migration) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

["What happens when it dies?" is the whole architecture review](blog-failure-modes) ·
[The cheapest cost review happens before the merge](blog-finops-cost-gates) ·
[Cost governance is three verbs: estimate, meter, standardize](blog-finops-governance) ·
[Migrating observability: on-premises → Grafana Cloud](blog-grafana-cloud-migration) ·
[SLOs and error budgets — turning "is it up?" into a number you can spend](blog-slo-error-budgets) ·
[Backstage — the developer portal](landscape-backstage) ·
[Cloud Native Buildpacks — images without Dockerfiles](landscape-buildpacks) ·
[Cilium — the CNI, chosen at cluster creation, not GitOps'd in later](landscape-cilium) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[OpenCost — cost allocation, per tenant, per namespace](landscape-opencost) ·
[OpenTelemetry — instrument once, everywhere](landscape-opentelemetry) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy)
