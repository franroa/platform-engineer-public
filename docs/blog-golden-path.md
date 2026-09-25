# 🛤️ The golden path is three files, not a wiki page

> 💡 **TL;DR** — a new service here is an app repo with three composition points:
> `.gitlab-ci.yml` *includes* a pipeline component, `infra/main.tf` *uses* Terraform modules,
> `chart/Chart.yaml` *depends on* platform Helm charts. Everything below — network, cluster,
> tenant, guardrails — already exists. The golden path isn't documentation about how to do it
> right; it's the paved road where doing it right is the shortest route.

## 1 · Golden paths fail as documents

Every platform team has written the "how to ship a service" wiki page, and every wiki page has
drifted from reality within a quarter. The version that works is **executable**: the path *is*
the [reusable libraries](blog-reuse-libraries), and following it means composing them. There's
nothing to keep in sync because there's no second copy of the truth.

## 2 · What the app team actually touches

The [creation story](build-an-app) runs Region → Cluster → Tenant → App, and the first three
levels are the platform's job. By the time a team ships, it inherits a peered network, a
running cluster with ingress and observability, a namespace with RBAC, PIM-backed groups, and
a [Key Vault it can use but not break](blog-tenant-keyvaults). The app repo
([worked example](example-app)) adds only:

- **`.gitlab-ci.yml`** — `include:` the `terraform-tenant-deploy` component → plan → OPA → apply.
- **`infra/main.tf`** — `module` blocks from `up-modules` → a database, secrets written into
  the tenant-region vault.
- **`chart/Chart.yaml`** — `dependencies:` on `up-helm-charts` → Deployment, Service,
  HTTPRoute in the tenant namespace.

That's the whole interface. What's *specific* to the app lives in the repo; what's *shared*
arrives by reference.

## 3 · Guardrails make the path golden, not just paved

A paved road nobody has to take is a suggestion. Two things make this one the default:

- **The gate travels with the path.** The pipeline component carries the
  [OPA policy pack](security-opa) — take the path, get the guardrails; there is no
  ungoverned variant to copy from a neighbouring repo.
- **The path is the fastest option.** The same pipeline runs locally before push
  ([dev workflow](dev-workflow)) with fidelity to the remote steps — so the golden path wins
  on developer experience, not compliance pressure.

## 4 · What I'd tell a team building one

1. Ship a worked example repo, not a template — templates rot, examples get tested.
2. Count the files a new service needs; every file past three is friction to burn down.
3. Never let a guardrail be a separate step — bundle it into the thing teams already include.
4. If someone leaves the path, treat it as a product signal: the path was too slow or too
   narrow. Fix the path.

## Related

[Build an App](build-an-app) · [Example app](example-app) · [Reuse & golden paths](reuse) ·
[Three libraries, one platform](blog-reuse-libraries) · [Dev workflow](dev-workflow) ·
[✍️ all articles](blog-index)
