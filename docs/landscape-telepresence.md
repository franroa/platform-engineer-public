# 🔌 Telepresence — the laptop joins the cluster

> 💡 **TL;DR** — for the class of bug that only exists *in* the cluster (service discovery,
> real data shapes, mesh policies), Telepresence intercepts a workload and routes its
> traffic to the process on my laptop — debugger attached, code hot-reloading, cluster
> unchanged. It's the borrowed half of my [local-first tooling](blog-local-remote-ci).

## The job it does here

- **Intercepts against sandbox clusters**: the sandbox stage of a tenant's namespace is
  interceptable; live stays hands-off — same [trust tiers](blog-agent-of-empires) as
  everything else.
- **Personal intercepts** route only *my* requests (header-scoped) — teammates and smoke
  tests keep hitting the deployed pod.
- **Pairs with [kind](blog-local-remote-ci)**: kind for "does it run at all", Telepresence
  for "why does it break only up there".

## What I'd tell you before adopting

1. Scope it: sandbox namespaces yes, production no — enforce with RBAC, not discipline.
2. Prefer personal intercepts by default; global intercepts are a shared-environment
   footgun.
3. The traffic-manager is a cluster component — version and deploy it like the platform,
   not like a CLI.

## Where it runs

`ns: ambassador` · sandbox clusters only (`platform-services/sandbox/`) · sync wave 0 · chart `telepresence 2.21.1`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: laptop-to-cluster intercepts are a sandbox feature and a live-cluster incident.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-telepresence)

## Related

[Run the pipeline before you push it](blog-local-remote-ci) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[The landscape — CNCF & friends I actually run](landscape-index)
