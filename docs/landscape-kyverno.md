# 🛡️ Kyverno — policy inside the cluster

> 💡 **TL;DR** — the platform gates terraform with [OPA/rego before apply](blog-terraform);
> Kyverno is the same idea *inside* the cluster: admission policies that validate, mutate
> and generate resources so tenant namespaces are safe by default — written as Kubernetes
> resources, reviewable like everything else.

## The job it does here

- **Validate**: registries allowlist, resource limits present, labels that the
  [observability defaults](landscape-opentelemetry) rely on, no `latest` tags.
- **Mutate**: inject the boring-but-critical defaults (seccomp profiles, node selectors for
  [dedicated pools](blog-kubernetes)) so tenants don't have to know them.
- **Generate**: every new namespace gets its baseline — network policy, quota, the
  [External Secrets](landscape-external-secrets) store binding — created *by policy*, not by
  a runbook.

## What I'd tell you before adopting

1. Start in `Audit` mode and watch the policy reports; flip to `Enforce` per-policy.
2. Policies are code: test them (kyverno-cli in CI) and version them with the platform.
3. Prefer generate-on-namespace over "remember to create X" — runbooks rot, policies don't.

## Where it runs

`ns: kyverno-system` · every cluster (`platform-services/base/`) · sync wave −2 · chart `kyverno 3.3.4`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: admission webhooks must exist before the first tenant namespace ever syncs — safe-by-default is a boot ORDER, not a hope.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-kyverno)

## Related

[Terraform at scale (the OPA gate)](blog-terraform) · [Multi-tenant Kubernetes](blog-kubernetes) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[Golden paths fail when they're built for the platform team](blog-golden-paths-fail) ·
[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Cilium — the CNI, chosen at cluster creation, not GitOps'd in later](landscape-cilium) ·
[External Secrets — Key Vault to pods, no humans](landscape-external-secrets) ·
[Falco — the third layer: catching what already got past the first two](landscape-falco) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus) ·
[OpenTelemetry — instrument once, everywhere](landscape-opentelemetry) ·
[Policy Reporter — one dashboard for every policy engine](landscape-policy-reporter) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy)
