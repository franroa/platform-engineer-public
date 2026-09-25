# Identity & Access — the outermost envelope

> Repos: `up-bootstrap`, `up-identity`, `up-tenants`

Everything in the platform runs **as an identity**, so identity is the outer shell that contains all other layers. Nothing is deployed, peered or scaled except through an Azure AD (Entra ID) principal that some policy has authorised.

## The core idea: least privilege, activated on demand

Humans do **not** hold standing power. Access is split into two very different shapes:

- **People** get **PIM-activated** roles — time-limited (e.g. an 8-hour window), justification required, fully audited. Admin and contributor roles must be *activated* before use and expire automatically.
- **Automation** (CI/CD, controllers) gets **operator** identities — managed identities / service accounts with permanent, standing access and **no human members**. Pipelines can't wait for a human to click "activate".

This is why every tier defines parallel group sets:

```
{scope}-{tier}-admins        # PIM activation required
{scope}-{tier}-contributors  # PIM activation required
{scope}-{tier}-operators     # permanent — automation only, no humans
{scope}-readers              # permanent read-only
```

## Why bootstrap is separate

`up-bootstrap` owns the **account-level** concerns that literally everything depends on: RBAC, PIM policies, the platform operator managed identities, and the audit Log Analytics workspace. It is deployed first and re-pointed in lockstep whenever state moves. GitLab runners, tenants and every platform module consume the identities it publishes via remote state.

## Why identity is modelled as data

`up-identity` and `up-tenants` define groups and memberships as **YAML** (`{tenant}-{domain}-{purpose}`), and Terraform turns that YAML into Azure AD groups, PIM policies, RBAC assignments and Key Vault roles. Membership becomes a reviewable merge request, not a portal click — the audit trail is the git history.

## Pseudocode: how an operator identity is wired

```
for each (tier in [sandbox, live]):
    identity   = create_managed_identity("platform-{tier}-operator")
    group      = create_group("platform-{tier}-operators")   # permanent access
    add_member(group, identity)
    federate(identity, from = "kubernetes ServiceAccount")    # OIDC, no secrets
    grant(identity, role = Owner, scope = "*-{tier} subscriptions")
```

The result: CI/CD authenticates with short-lived OIDC tokens — **no secrets stored anywhere** — and every privileged human action is a logged, expiring PIM activation.

## ✍️ Related writing

[Nobody holds standing power](blog-access-as-code) ·
[A raw model key is a budget with no owner and no off switch](blog-ai-gateway) ·
[Every alert email can prove where it came from](blog-azure-email) ·
[Defense in depth — no single wall, because walls fall](blog-defense-in-depth) ·
[A runner that can only touch its own tenant](blog-gitlab-runners) ·
[You can't SSH into production — that's the feature](blog-immutability) ·
[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[A SAS token is a one-year password you forgot you minted](blog-storage-proxy) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Well-architected is a set of questions, not a badge](blog-well-architected)
