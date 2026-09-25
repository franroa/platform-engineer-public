# Example App — everything reusable, in a tenant

Here's a concrete tenant workload — **`orders-service`**, owned by the **`up-tenants`** tenant — that reuses **all three** platform libraries at once. This is the pattern every app follows.

Its repo contains almost no boilerplate. It composes three shared libraries and adds only what's specific to `orders-service`.

## 1 · Pipeline — reuse a **GitLab component**

```yaml
# orders-service/.gitlab-ci.yml
include:
  - component: $CI_SERVER_FQDN/nimbus/ultraplatform/development/up-ci-components/base@1
  - component: $CI_SERVER_FQDN/nimbus/ultraplatform/development/up-ci-components/terraform-tenant-deploy@1
    inputs:
      tenant: up-tenants
      module: infra          # the app's own Terraform (below)
      safety_level: high     # OPA gate — enforced by the component
```

The app gets **plan → OPA → apply**, tenant state isolation and secretless OIDC auth — for free.

## 2 · Infrastructure — reuse **Terraform modules**

```hcl
# orders-service/infra/main.tf
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

The app declares *what* it needs (a DB, a vault); the modules know *how* to build them. The OPA gate checks this plan before apply.

## 3 · Deployment — reuse **Helm charts**

```yaml
# orders-service/chart/Chart.yaml
apiVersion: v2
name: orders-service
version: 0.4.0
dependencies:
  - name: web-service                 # from up-helm-charts
    version: 3.1.0
    repository: oci://registry/nimbus/ultraplatform/up-helm-charts
  - name: postgres-connection
    version: 1.2.0
    repository: oci://registry/nimbus/ultraplatform/up-helm-charts
```

```yaml
# orders-service/chart/values.yaml  — the ONLY app-specific part
web-service:
  image: registry/.../orders-service:0.4.0
  replicas: 3
  route: { host: orders.up-tenants.ultraplatform }
```

`helm dependency update` pulls the platform charts; the release is assembled from shared parts + this thin `values.yaml`.

## The result

```
orders-service (up-tenants tenant)
├─ .gitlab-ci.yml  →  include: up-ci-components (GitLab component)  ── plan→OPA→apply
├─ infra/main.tf   →  module: up-modules      (Terraform modules)  ── DB + Key Vault
└─ chart/Chart.yaml→  dependencies: up-helm-charts (Helm charts)    ── web-service + db
                                    deploys into the tenant namespace on AKS
```

Three libraries, one thin app repo. Everything reusable, everything versioned, the policy gate always in the path. Develop and prove it locally first with *gctui* (the pipeline) and *tflocal* (the modules) — see *dev-workflow*.

## ✍️ Related writing

[The golden path is three files, not a wiki page](blog-golden-path) ·
[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes)
