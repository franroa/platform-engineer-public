# 🏃 A runner that can only touch its own tenant

> 💡 **TL;DR** — GitLab is configured **per tenant**. The pipeline's environment variables pin
> each runner to exactly one tenant's **managed identity** — one that can assign permissions
> only inside its own tenant. There is no variable a tenant can set to make its runner act as
> another tenant. The env-var configuration *is* the security boundary, and it's provisioned by
> the platform, outside any tenant's reach.

## 1 · One runner identity per tenant

A tenant's CI doesn't authenticate as "a shared build robot." It authenticates as **that
tenant's** operator identity. The wiring lives in the tenant's GitLab configuration
([`up-gitlab`](gitlab-runners)): the deploy variables — `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID`, and the
federated-credential subject that maps the job to a **managed identity living in that tenant** —
are set at the tenant level, not by the app repo. A job presents its GitLab OIDC token, Azure's
federation trusts it, and the job assumes *its own tenant's* managed identity for the run.
[No long-lived secrets](blog-access-as-code) change hands; the identity is the configuration.

## 2 · The identity can only write in its tenant

That managed identity holds [Contributor over its tenant's resources](blog-tenant-isolation)
and nothing beyond them. So `Microsoft.Authorization/roleAssignments/write` **succeeds inside
the tenant and 403s everywhere else** — the same

```
403 AuthorizationFailed: ... does not have authorization to perform action
'Microsoft.Authorization/roleAssignments/write' over scope '<resource-scope>'
```

you'd hit if a job ever pointed Terraform at another tenant's scope. The token is minted for
the wrong tenant, so the write is refused. The runner's blast radius is precisely one tenant,
enforced by the identity it's allowed to assume — not by a convention everyone promises to
follow.

## 3 · No self-service escalation

A tenant owns its `.gitlab-ci.yml` and its CI variables — and that's fine, because owning them
buys it nothing across the fence. The managed identities and the **federation trust** that
back them are provisioned by the platform in [`up-identity`](identity-pim) / `up-gitlab`, not by
the tenant. A tenant can't:

- point its federated credential at a different tenant's identity (it doesn't control the trust);
- assume an identity that has power in another tenant (none of them do); or
- write itself an RBAC grant into another tenant (that's the 403 in §2).

Legitimate cross-tenant access takes the other road: a merge request in the platform-owned
[`up-cross-tenant`](tenants) repo, reviewed and applied with the **owning** tenant's
credentials — never assembled from a tenant's own env vars.

## 4 · Why per-tenant GitLab config beats one shared runner

A single fat runner with rights across every tenant is one leaked token away from a
cross-tenant incident, and its audit log can't tell you *which* tenant an action was "for."
Per-tenant configuration makes the boundary legible: every job runs as a named tenant identity,
every apply is attributable, and the worst case for a compromised pipeline is bounded by the one
tenant it belongs to. The env vars aren't just config — they're the smallest, most auditable
place the isolation is expressed.

## 5 · What I'd tell a team adopting this

1. Give each tenant's CI **its own** managed identity; never a shared one with cross-tenant power.
2. Provision the identity and its federation trust in a **platform-owned** repo — the tenant may
   consume it, never mint it.
3. Let tenants own their pipeline YAML freely; the security property must not depend on that YAML
   being well-behaved.
4. When a runner 403s across a tenant line, celebrate quietly — that's the boundary refusing to
   be talked around.

## Related

[GitLab CI · runners](gitlab-runners) · [A 403 is usually the fence doing its job](blog-tenant-isolation) ·
[Nobody holds standing power](blog-access-as-code) · [Tenants](tenants) ·
[Run the pipeline before you push it](blog-local-remote-ci) · [✍️ all articles](blog-index)
