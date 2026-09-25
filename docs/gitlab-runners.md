# GitLab & Runners — the delivery engine

> Repos: `up-gitlab`, `development/up-ci-components`, `development/up-ci-toolkit`

GitLab is both the source of truth and the **engine** that applies it. `up-gitlab` manages the GitLab.com account as code (core group settings, the in-cluster environment, and runners), so pipeline infrastructure isn't a pile of manual clicks.

## Runners run *inside* the platform

Runners are deployed by Helm **into the AKS clusters** and authenticate using the **platform operator managed identities** via **federated OIDC credentials** — no stored secrets. This closes the loop: the platform builds the platform, using its own identity model.

- Each **tier** (sandbox / live) has its own operator identity → isolation between environments.
- Runners have **hard resource ceilings** (`overwrite_max_allowed`) so a job can't over-provision a node.
- **Build runners** are sized (small / medium / large) with `cpu_request == cpu_limit` and `memory_request == memory_limit` → **Guaranteed** QoS, so jobs aren't CFS-throttled or evicted.

## Reusable CI as components

`development/up-ci-components` publishes versioned, includable building blocks — the most important being `terraform-deploy`, which bundles **plan → OPA safety check → apply** into one job (see *Security & OPA*). Teams `include:` a component instead of copy-pasting pipeline YAML.

`development/up-ci-toolkit` ships the **pre-baked CI image** (Terraform, Azure CLI, kubectl, Task, jq/yq…) so every job starts from the same toolchain instead of installing tools each run.

## Pseudocode: a platform deploy pipeline

```yaml
include:
  - component: .../up-ci-components/terraform-deploy@<version>
    inputs: { module: azure-hub, safety_level: high }   # OPA gate = high

deploy:
  image: .../up-ci-toolkit:latest        # baked toolchain
  id_tokens: { OIDC: { aud: azure } } # federated → operator identity, no secrets
  script:
    - terraform plan  -out plan.tfout
    - opa eval  --data policies/ --input plan.json 'data.terraform.safety.allow'
    - terraform apply plan.tfout      # only runs if OPA allowed it
```

## Why build it this way?

- **One toolchain, one gate, one identity model** — consistency across every repo.
- **Secretless CI** via OIDC federation — nothing to leak or rotate.
- **Guaranteed, bounded runners** — predictable performance without letting jobs starve the cluster.

## ✍️ Related writing

[A runner that can only touch its own tenant](blog-gitlab-runners) ·
[Cloud Native Buildpacks — images without Dockerfiles](landscape-buildpacks) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy)
