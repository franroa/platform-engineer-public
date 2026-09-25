# GitLab CI Components — which, and for what

> `development/up-ci-components` *(the reusable CI library)* · run on runners from *GitLab & Runners* · guarded by *Security & OPA*

Instead of copy-pasting pipeline YAML, every repo `include:`s versioned **components**. Each component is a small, documented, input-driven building block.

## The components

| Component | What it does | Key inputs |
|---|---|---|
| **`base`** | Baseline pipeline: stages, default image (the `up-ci-toolkit` CI image), common rules, caching. Everything else builds on it. | — |
| **`terraform-deploy`** | The workhorse: **plan → OPA safety check → apply** in one job, for **platform** infrastructure. | `module`, `safety_level` |
| **`terraform-tenant-deploy`** | Same plan→OPA→apply, but scoped to a **tenant** (state isolation, tenant identity). Used by apps. | `tenant`, `module`, `safety_level` |
| **`env-trigger`** | Fans a change out into **per-environment** child pipelines (sandbox/live, per region). | `environments` |
| **`k8s-all-clusters-trigger`** | Runs a job across **every AKS cluster** (e.g. roll out a chart everywhere). | `clusters` |
| **`semver`** | Computes and tags **semantic versions** on release, so artifacts/images are versioned consistently. | `bump` |

## How you use one

```yaml
include:
  - component: $CI_SERVER_FQDN/nimbus/ultraplatform/development/up-ci-components/base@1
  - component: $CI_SERVER_FQDN/nimbus/ultraplatform/development/up-ci-components/terraform-deploy@1
    inputs:
      module: up-network/azure-hub   # what to deploy
      safety_level: high                  # OPA gate strictness (default)
```

## Why components

- **Versioned contracts.** `@1` pins a stable interface; you upgrade on your own schedule.
- **The safety gate is baked in.** You can't deploy Terraform *without* going through `terraform-deploy` → OPA, so the guardrail is impossible to forget.
- **Composable.** A pipeline is a short list of `include:`s + inputs, not hundreds of lines of YAML.

See the *Example App* for a component used by a real tenant workload, and *gctui* for running these components locally before you push.

## ✍️ Related writing

[The cheapest cost review happens before the merge](blog-finops-cost-gates) ·
[Migrating a self-managed GitLab to gitlab.com](blog-gitlab-migration) ·
[Run the pipeline before you push it](blog-local-remote-ci) ·
[Three libraries, one platform](blog-reuse-libraries)
