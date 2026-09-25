# 🧩 Dapr — building-block APIs a sidecar gives every language

> 💡 **TL;DR** — [Dapr](https://dapr.io/) (CNCF graduated) is a sidecar that hands every
> workload the same building-block APIs — pub/sub, state, service invocation, durable
> workflow — over localhost HTTP/gRPC, regardless of language. A team calls one API; Dapr
> talks to whichever broker/store is actually configured behind it. Same "consume a standard,
> swap the backend" shape as [OpenFeature](landscape-openfeature), applied to app plumbing
> instead of flags.

## The job it does here

- **One API, swappable backend.** Pub/sub against the sidecar means the actual broker
  (Service Bus, Kafka, whatever's configured) is an infrastructure decision, not a line of
  application code — the golden path's ["reuse, don't reinvent"](blog-reuse-libraries)
  argument, applied at the sidecar layer instead of the Terraform layer.
- **Durable workflow for the AI layer.** Multi-step, resumable orchestration (a workflow that
  survives a pod restart mid-run) is exactly the primitive [agentic AI pipelines](ai-ultraplatform)
  need and would otherwise hand-roll per team.
- **Opt-in per workload, not a platform-wide requirement.** A pod gets Dapr by annotation —
  teams that don't need the building blocks pay nothing; teams that do get them without
  writing a client library.

## What I'd tell you before adopting

1. **A sidecar is a second process to budget for.** Size requests/limits for it explicitly —
   an unaccounted sidecar quietly breaks the [Guaranteed-QoS](kubernetes) math every workload
   here relies on.
2. **Don't let it become a second service mesh by accident.** Dapr does building blocks, not
   mTLS/traffic-shaping at the mesh layer — scope it to what it's actually for.
3. **Version the building-block APIs like any dependency.** A Dapr upgrade that changes state-
   store semantics is a breaking change to every workload using it, not a platform-only concern.

## Where it runs

`ns: dapr-system` · every cluster (`platform-services/base/`) · sync wave −1 (the
sidecar-injector must exist before annotated workloads schedule) — pinned in
[`up-kubernetes`](kubernetes) `gitops/platform-services/`. Injection is per-pod, by
annotation — opt-in, not platform-wide.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-dapr)

## Related

[An AI layer for a developer platform](blog-ai-platform) ·
[Three libraries, one platform](blog-reuse-libraries) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[OpenFeature — decouple the deploy from the release](landscape-openfeature)
