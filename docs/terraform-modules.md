# Terraform Modules — reusable infrastructure

> `up-modules` *(the reusable Terraform module library)* · deployed by the `terraform-deploy` / `terraform-tenant-deploy` components · guarded by *Security & OPA*

Infrastructure is never written from scratch either. Common building blocks — databases, Key Vaults, container registries, batch pools, dashboards — live as **versioned Terraform modules** that any repo (platform *or* a tenant app) consumes with `module { source = … }`.

## Examples in the library

| Module | Provisions |
|---|---|
| `postgresql-k8s` | a PostgreSQL instance for a service |
| `azure-key-vault` | a Key Vault + scoped secret roles |
| `azure-container-registry` | a container registry |
| `azure-batch` | a batch compute pool |
| `grafana-dashboards` | dashboards as code |

## How you use one

```hcl
module "db" {
  source = "git::https://gitlab/nimbus/ultraplatform/up-modules//postgresql-k8s?ref=v2.3.0"
  name   = "orders-db"
  tenant = "up-tenants"
}

module "secrets" {
  source = "git::https://gitlab/nimbus/ultraplatform/up-modules//azure-key-vault?ref=v1.6.0"
  name   = "orders-kv"
}
```

## Why modules

- **Pinned versions (`?ref=v…`).** Reproducible infra; upgrade deliberately.
- **Same module, every environment.** The module renders sandbox and live identically — only inputs differ.
- **The OPA gate still applies.** However the infra is composed, `terraform-deploy` runs the plan through the policy check before apply — so a module can't sneak a protected-resource destroy past the gate.

Apps consume modules **and** charts **and** a component together — see the *Example App*. Run modules locally with *tflocal* before you ever push.

## ✍️ Related writing

[Idempotency: declare the end state, run it twice](blog-idempotency) ·
[Three libraries, one platform](blog-reuse-libraries) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform)
