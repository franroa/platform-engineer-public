# 🚧 A 403 is usually the fence doing its job

> 💡 **TL;DR** — every tenant is an isolated cell. A tenant's automation holds **Contributor**
> (almost-admin) over the resources it *owns* — and **nothing** anywhere else. So when a
> Terraform apply fails with `403 AuthorizationFailed` writing a role assignment, the usual
> cause isn't a missing permission: it's that the target lives in **another tenant**, and no
> amount of power in your own tenant lets you write into someone else's. That's the boundary
> working exactly as designed.

## 1 · The error that looks like a bug

A pipeline plans clean and then dies on apply:

```
Error: unexpected status 403 (403 Forbidden) with error: AuthorizationFailed:
The client '<client-id>' with object id '<object-id>' does not have authorization
to perform action 'Microsoft.Authorization/roleAssignments/write' over scope
'<resource-scope>' or the scope is invalid.
```

The same identity assigns roles happily elsewhere, so the instinct is "grant it one more
role." That instinct is wrong. Role assignments — like most ARM writes — can only be created
in the **tenant that owns the target resource**. An identity authenticated in tenant A cannot
write RBAC on a resource that lives in tenant B, no matter which roles it holds in A. The 403
isn't telling you a role is missing; it's telling you you're pointed at the wrong tenant.

## 2 · Why the tenants are separated in the first place

Each tenant is its own trust boundary. Inside its boundary a tenant's operator identity is
[Contributor](blog-access-as-code) over the resources it owns — it can create, wire and tag
its own network, namespaces, apps and data. That's deliberately close to admin: a tenant
should be able to move fast inside its own walls.

What it can't do is reach *out*. It has **zero standing power** in any other tenant, and —
crucially — it can't grant itself any. `roleAssignments/write` is the one verb that would let
a tenant escalate, and it only works against scopes its own tenant owns. So the property that
actually matters is negative: **no tenant can hand itself access to another tenant's
resources.** The 403 is that property, made visible.

## 3 · Where legitimate cross-tenant access lives

Real platforms still need controlled cross-tenant access — a shared hub, a central log sink, a
platform service one tenant consumes. That access is **not** self-service. It lives in a
separate, platform-owned repo (`up-cross-tenant`) whose entire job is to express cross-tenant
grants, review them as merge requests, and apply each one **with credentials scoped to the
tenant that owns the target**. A tenant can *request* a grant by opening an MR there; it can
never *mint* one from inside its own pipeline. The place a grant is written is the place it's
allowed to be written — the owning tenant — and nowhere else.

## 4 · Reading a 403 correctly

When apply 403s on a role assignment, the debugging move is not "add a role." It's:

1. Take the target scope and **trace the subscription back to its tenant**.
2. Compare that to the tenant your pipeline actually authenticated against.
3. If they differ, you've found the real problem — and one of two things is true:
   - it's a **legitimate cross-tenant need** → it belongs in [`up-cross-tenant`](tenants),
     applied with the owning tenant's credentials, not bolted onto this pipeline; or
   - it's a **mistake** → your provider/state is pointed at the wrong tenant, fix the wiring.

Either way the fix respects the boundary instead of drilling through it.

## 5 · What I'd tell a team adopting this

1. Give a tenant near-admin power **inside** its cell and none outside it — the asymmetry is
   the whole design.
2. Make "grant myself cross-tenant access" structurally impossible, not merely discouraged.
3. Keep cross-tenant grants in one owned repo, applied in the owning tenant — auditable as a
   diff, never a portal click.
4. Treat a cross-tenant 403 as a **signal**, not an obstacle: it's telling you which tenant
   owns the thing you're touching.

## Related

[Tenants](tenants) · [GitLab runners, one identity per tenant](blog-gitlab-runners) ·
[Nobody holds standing power](blog-access-as-code) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Security & OPA](security-opa) · [✍️ all articles](blog-index)
