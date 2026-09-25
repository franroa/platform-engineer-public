# 📦 Three libraries, one platform

> 💡 **TL;DR** — nothing is written twice. Pipelines come from **GitLab CI components**
> (`up-ci-components`), infrastructure from **Terraform modules** (`up-modules`), deployments
> from **Helm charts** (`up-helm-charts`) — all versioned, all consumed by reference, all
> guarded by one central **OPA policy pack**. Teams describe what's specific to their app;
> everything else is a library import.

## 1 · One reuse grammar, three artifact types

The trick isn't any single library — it's that all three are consumed the **same way**:

| Library | You reuse | Consumed via |
|---|---|---|
| CI components | pipeline jobs (plan → OPA → apply, triggers, versioning) | `include:` in `.gitlab-ci.yml` |
| Terraform modules | infrastructure (databases, Key Vaults, registries…) | `module { source = …?ref=v2.3.0 }` |
| Helm charts | how a service runs on Kubernetes | `dependencies:` in `Chart.yaml` |

Reference + version, never copy. A bug fix or a new best practice lands **once** in the
library; every consumer picks it up on the next version bump — and only on the bump, so
upgrades are deliberate, reviewable events, not surprises.

## 2 · Modules are the only coupling between tiers

Repos are tiers ordered by dependency ([repos by level](repos-by-level)): network before
cluster, cluster before tenant, tenant before app. Higher tiers consume lower tiers **only**
through remote state and versioned [modules](terraform-modules) — never by path, never by
copy. That single rule is what keeps dozens of repos coherent across four regions: the module
version is the contract, and `?ref=` is the signature on it.

## 3 · Charts encode "how we deploy" so app repos don't

The chart library ([Helm charts](up-helm-charts)) owns the opinions: probes, resource limits,
labels that route cost, the HTTPRoute wiring into the shared ingress. An app's `Chart.yaml`
declares a dependency and provides values. When the platform changes its deployment opinion —
new ingress class, new default probes — it ships a chart version, not forty merge requests.

## 4 · Components make every pipeline the same pipeline

Every repo's CI is an `include:` of the same components ([GitLab components](gitlab-components)):
base, env-trigger, terraform-deploy. Which means every repo gets the **policy gate for free** —
the terraform-deploy component loads the central rego pack ([Security & OPA](security-opa)) and
enforces the safety level the repo picks (`paranoid | high | standard | custom`). Consistency
isn't a code-review comment here; it's the only path available.

## 5 · What I'd tell a team starting a library

1. Version from day one — an unversioned library is copy-paste with extra steps.
2. Put the policy pack **inside** the pipeline component, not beside it — guardrails that need
   opting into aren't guardrails.
3. Treat the library's README as its API doc: inputs, outputs, one working example.
4. Measure adoption by *deletions* in consumer repos — the best library PR removes code.

## Related

[Reuse & golden paths](reuse) · [Terraform modules](terraform-modules) ·
[Helm charts](up-helm-charts) · [GitLab components](gitlab-components) ·
[Security & OPA](security-opa) · [✍️ all articles](blog-index)
