# 🔄 Reloader — config changes reach running pods

> 💡 **TL;DR** — Kubernetes updates ConfigMaps and Secrets in place but running pods keep
> the old values; Reloader closes that gap by rolling workloads when their config changes.
> It's the tiny tool that makes [External Secrets](landscape-external-secrets) rotation
> *actually* land.

## The job it does here

- **Annotation-driven**: the library charts ship `reloader.stakater.com/auto: "true"` on
  workloads — tenants inherit correct behavior from [the chart library](landscape-helm)
  without knowing this problem exists.
- **Completes the rotation chain**: vault rotate → ESO sync → Reloader rollout — the whole
  path is machine-driven, observable, and needs no redeploy MR.

## What I'd tell you before adopting

1. Pick annotation-per-workload (auto) over listing config names — lists drift.
2. Mind rollout storms: a shared ConfigMap change rolls everything that mounts it; batch
   changes and rely on PodDisruptionBudgets.
3. It's a stop-gap by design — apps that hot-reload config don't need it; most apps aren't
   those apps.

## Where it runs

`ns: reloader` · every cluster (`platform-services/base/`) · sync wave −1 · chart `reloader 1.2.0`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: closes the loop on rotated secrets: rotation restarts the pods that mount them.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-reloader)

## Related

[External Secrets](landscape-external-secrets) · [Helm](landscape-helm) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[TLS is easy; rotating certificates without downtime is the real job](blog-tls-rotation) ·
[External Secrets — Key Vault to pods, no humans](landscape-external-secrets) ·
[Helm — the packaging grammar](landscape-helm) ·
[The landscape — CNCF & friends I actually run](landscape-index)
