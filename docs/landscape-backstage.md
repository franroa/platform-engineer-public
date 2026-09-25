# 🎭 Backstage — the developer portal

> 💡 **TL;DR** — [Backstage](https://github.com/backstage/backstage) is the front door to the
> platform: a **software catalog** of who-owns-what, a **scaffolder** that turns the golden path
> into a "create service" button, and **TechDocs** so a service's docs live next to its code.
> The platform's paved road, made discoverable.

## The job it does here

- **Software catalog** — every service, its owner, its dependencies and its APIs in one graph,
  fed from `catalog-info.yaml` in each repo — the same source-of-truth discipline as the
  [3D map](overview) itself.
- **Golden-path scaffolder** — "new service" generates the [three files](blog-golden-path) (CI
  component + Terraform + Helm) pre-wired, so doing it right is a template, not tribal knowledge.
- **Scorecards & TechDocs** — maturity checks and docs-as-code surface next to each component,
  so ownership and health are visible, not folklore.

## What I'd tell you before adopting

1. Seed the catalog from code (`catalog-info.yaml`), never by hand — a stale catalog is worse
   than none.
2. Ship one scaffolder template that encodes the golden path before you ship ten.
3. Make ownership a required field; an unowned component is an incident waiting for a name.

## Where it runs

`ns: backstage` · the eu01 hub only (`platform-services/hub/`) · sync wave 0 · chart `backstage 2.3.0` + the postgresql-k8s module
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: one catalog, one scaffolder, one TechDocs.
What a hub outage does (and doesn't) take with it: [if the hub dies](landscape-grafana).

[**▶ See it in the cluster**](#aks=eu01&d=landscape-backstage)

## Related

[The golden path](blog-golden-path) · [The whole model — overview](overview) ·
[An AI layer for the platform](blog-ai-platform) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[Cloud Native Buildpacks — images without Dockerfiles](landscape-buildpacks) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index)
