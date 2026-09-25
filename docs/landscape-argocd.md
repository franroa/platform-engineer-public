# 🐙 Argo CD — the cluster state is a repo

> 💡 **TL;DR** — Argo CD makes the clusters *declarative all the way down*: what runs in a
> cluster is what its repo says, drift is visible, and rollback is `git revert`. The map's
> globe literally draws an **Argo CD ⟵ Git** door from outside — it's one of the two ways
> anything enters the platform.

## The job it does here

- **App-of-apps per cluster** — each cluster syncs a root application that fans out to the
  namespaces declared in [`up-namespaces`](blog-kubernetes); a namespace file that names a
  cluster IS the deployment intent.
- **Drift as a signal, not a surprise.** OutOfSync is a dashboard state the platform watches
  — the same philosophy as the map's own [drift badge](blog-terraform).
- **No kubectl in pipelines.** CI builds and publishes; Argo pulls. The clusters have no
  standing inbound credentials — the same
  [secretless posture](blog-access-as-code) as the rest of the platform.

## What I'd tell you before adopting

1. Decide the repo topology first (per-cluster root + per-team folders scales; one giant
   app does not).
2. Sync waves and health checks are the real learning curve — invest early.
3. Let Argo own the namespace: manual objects in synced namespaces become drift noise.

## Where it runs

`ns: argocd` · every cluster (`platform-services/base/`) · sync wave −3 · chart `argo-cd 7.7.12`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: Argo manages Argo — terraform only seeds the first install; upgrades are a chart bump in review.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-argocd)

## Related

[Multi-tenant Kubernetes](blog-kubernetes) · [Nobody holds standing power](blog-access-as-code) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[Idempotency: declare the end state, run it twice](blog-idempotency) ·
[You can't SSH into production — that's the feature](blog-immutability) ·
[Blue-green and canary — ship to a few before you ship to everyone](blog-progressive-delivery) ·
[Replace, don't repair — cattle, not pets](blog-replace-dont-repair) ·
[Helm — the packaging grammar](landscape-helm) ·
[The landscape — CNCF & friends I actually run](landscape-index)
