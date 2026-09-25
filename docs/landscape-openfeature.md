# 🚩 OpenFeature — decouple the deploy from the release

> 💡 **TL;DR** — [OpenFeature](https://openfeature.dev/) (CNCF incubating) is a vendor-neutral
> feature-flag **spec + SDK**: application code evaluates a flag through one API, backed by
> whichever provider you choose — `flagd` running in-cluster here — so switching providers is
> a config change, not a rewrite. The point isn't flags, it's the property they buy: a deploy
> and a release become two separate decisions.

## The job it does here

- **Deploy ≠ release, for real.** [Progressive delivery](blog-progressive-delivery) already
  shifts traffic gradually at the infrastructure layer; OpenFeature shifts *behavior* at the
  application layer — dark-launch a feature to internal tenants before it's a canary rollout,
  not after.
- **No vendor lock-in on the API.** Because the spec is the boundary, a team's application
  code never imports a specific vendor SDK — the same "consume a standard, not a
  vendor" shape as [OpenCost](landscape-opencost) for cost or
  [OpenTelemetry](landscape-opentelemetry) for traces.
- **`flagd` as the boring default.** A lightweight in-cluster provider means no external
  SaaS dependency for the common case — teams reach for a hosted provider only when they
  need targeting rules `flagd`'s file/Kubernetes-CRD backends don't cover.

## What I'd tell you before adopting

1. **A flag with no owner is tech debt with extra steps.** Every flag needs a name, an owner,
   and an expiry — a permanent flag is a permanent `if` branch nobody dares delete.
2. **Flags are not a substitute for the golden path's config story.** Use them for behavior
   toggles and rollout control, not as a general parameter-passing mechanism.
3. **Evaluate close to the decision, not at startup** — a flag cached at boot defeats the
   entire point of deploy/release decoupling.

## Where it runs

`ns: openfeature` (the `flagd` provider) · every cluster (`platform-services/base/`) · sync
wave −1 — pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Applications
consume it through the OpenFeature SDK; the provider is swappable without touching app code.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-openfeature)

## Related

[Blue-green & canary — progressive delivery](blog-progressive-delivery) ·
[OpenTelemetry — instrument once, everywhere](landscape-opentelemetry) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[Dapr — building-block APIs a sidecar gives every language](landscape-dapr) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[OpenCost — cost allocation, per tenant, per namespace](landscape-opencost) ·
[OpenTelemetry — instrument once, everywhere](landscape-opentelemetry)
