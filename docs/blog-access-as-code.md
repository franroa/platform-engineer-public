# 🪪 Nobody holds standing power

> 💡 **TL;DR** — humans get **PIM-activated roles** (time-boxed, justified, audited);
> automation gets **standing operator identities** with no human members; and every membership
> is **YAML in a repo**, turned into Azure AD groups, PIM policies and RBAC by Terraform.
> Access is a merge request with a git history — never a portal click someone forgot about.

## 1 · Two shapes of access, never mixed

The single most clarifying identity decision in this platform
([Identity & PIM](identity-pim)): people and automation get *structurally different* access.

- **People** hold roles that are dormant by default. Admin work means **activating** a PIM
  role — an 8-hour window, a justification, an audit event. When the window closes, the power
  is gone. There is no "temporarily added, permanently forgotten."
- **Automation** — pipelines, controllers — gets **operator identities**: managed identities
  with permanent, scoped access and **zero human members**. CI can't wait for a human to click
  "activate", and humans shouldn't borrow robot credentials.

Every tier declares the same four groups, so the grammar is learnable in one sitting:
`{scope}-{tier}-admins` and `-contributors` (PIM), `-operators` (automation), `-readers`
(permanent, read-only).

## 2 · Membership is data

Groups and memberships live as YAML in `up-identity` and `up-tenants`; Terraform turns them
into AD groups, PIM policies, RBAC assignments and [Key Vault roles](blog-tenant-keyvaults).
Which means access changes travel the same road as infrastructure changes: branch, merge
request, review, pipeline, [OPA gate](security-opa). "Who has access to what, and since when?"
is answered by `git log`, not by an export from a portal nobody trusts.

The same file that grants a developer access to a tenant also *documents* it — the grant and
the record are one artifact, so they can't drift apart.

## 3 · Secretless CI: identity without credentials

Pipelines authenticate to the cloud via **OIDC federation** — the GitLab job presents its
identity token, Azure trusts the federation, and the job assumes its operator identity for the
duration of the run. No long-lived service principal secrets in CI variables, nothing to
rotate, nothing to leak in a job log. The [bootstrap tier](identity-pim) exists precisely to
own this wiring: the operator identities and the trust relationships everything else stands on.

## 4 · What I'd tell a team adopting this

1. Split human and automation access *first* — every later decision gets easier.
2. Make readers permanent and generous; make writers temporary and justified.
3. Keep the group grammar boring and uniform — clever names are an audit tax.
4. If an access change can't be reviewed as a diff, you don't have access control; you have
   access folklore.

## Related

[Identity & PIM](identity-pim) · [Tenants](tenants) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Security & OPA](security-opa) · [✍️ all articles](blog-index)
