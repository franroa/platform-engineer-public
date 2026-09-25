# Reuse — three libraries, one platform

The whole platform is built on a simple idea: **nothing is written twice.** Teams don't hand-roll pipelines, infrastructure or deployments — they **consume shared, versioned building blocks** and only describe what's specific to their app.

There are **three reusable libraries** (plus the policy library that guards them all):

| Library | Alias repo | What you reuse | Consumed via |
|---|---|---|---|
| **GitLab CI components** | `development/up-ci-components` | pipeline jobs (plan → OPA → apply, triggers, versioning) | `include:` in `.gitlab-ci.yml` |
| **Terraform modules** | `up-modules` | infrastructure (databases, Key Vaults, registries…) | `module { source = … }` |
| **Helm charts** | `up-helm-charts` | how a service is deployed to Kubernetes | `dependencies:` in `Chart.yaml` |
| **OPA / rego policies** | `development/up-ci-toolkit/policies/terraform` | the safety rules every deploy is checked against | the `terraform-deploy` component |

## Why libraries, not copy-paste

- **One place to fix.** A bug or a new best practice lands once in the library; every consumer gets it on the next version bump.
- **Consistency by default.** Every app's pipeline, infra and deployment look the same, so they're reviewable and auditable.
- **Least surprise.** New services start from proven blocks instead of a blank file.

## Where do the OPA policies live?

Centrally, in **`development/up-ci-toolkit/policies/terraform/`** — the same image that runs CI. They're organised by protection level and provider:

```
policies/terraform/
├── common.rego        # shared helpers
├── paranoid.rego      # block ALL destroys
├── high.rego          # imports azurerm.high  (default)
├── standard.rego      # imports azurerm.standard
└── azurerm/{standard,high}.rego
```

- The **`terraform-deploy` component** loads them and enforces the level you pick with `safety_level: paranoid|high|standard|none|custom`.
- A repo that needs its own rule drops an **`opa/terraform.rego`** in its tree and selects `safety_level: custom`.

So: **shared policies are platform-owned and versioned; per-repo policies are the exception, not the rule.** See *Security & OPA* and the *Example App*.

## How it's used day-to-day

Reuse only pays off if the feedback loop is fast. That's what the custom tools are for — see *gctui* (run the reusable pipeline locally), *tflocal* (run the reusable modules locally) and *dev-workflow* (the whole loop, timed with the time-tracker).

## ✍️ Related writing

[The golden path is three files, not a wiki page](blog-golden-path) ·
[A marketplace of one — versioning your own AI skills](blog-marketplace) ·
[Three libraries, one platform](blog-reuse-libraries) ·
[Twelve-Factor isn't a checklist — it's what the platform makes free](blog-twelve-factor) ·
[Well-architected is a set of questions, not a badge](blog-well-architected)
