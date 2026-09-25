# 🔐 Your secrets don't live in your resource group

> 💡 **TL;DR** — every tenant gets **one Key Vault per region** (`kv-{tenant}-{region}`), but the
> vault deliberately lives in a **platform-owned resource group**, not the tenant's. The tenant
> can *read and write secrets* (data plane) but can't *delete or re-permission the vault*
> (management plane). One placement decision removes a whole class of self-inflicted outages.

## 1 · The failure this prevents

A tenant owns its resource group — that's the point of tenancy. It can create, tag, and yes,
**delete** what's inside. Now put the [Key Vault](res-key-vault) in that same RG and walk
through the bad day: a teardown script, a `terraform destroy` with the wrong workspace, an
overly enthusiastic cleanup. The secrets, the access policies, the soft-delete configuration —
gone, together with the app that needed them to restart.

The vault is the one resource whose loss makes *recovery itself* harder. So it gets special
placement: **outside the blast radius of the team that uses it**.

## 2 · The split: data plane vs management plane

Azure separates what you can do *to* a vault from what you can do *inside* it, and the pattern
leans on exactly that line:

- **Tenant** → *Key Vault Secrets Officer* on the vault — read/write secrets, day-to-day work.
- **Platform** → owns the vault's resource group — lifecycle, purge protection, access policy,
  diagnostics. Changes here are platform merge requests, not tenant portal clicks.

The tenant loses nothing it actually needs. It never needed to delete the vault — it needed
its secrets available at 3 a.m.

## 3 · Why per region, not per tenant

One global vault per tenant would be simpler. It would also be a single point of failure
spanning four regions, a latency tax on three of them, and a data-residency question with no
good answer. `kv-{tenant}-{region}` keeps secrets **next to the workloads that read them**,
lets a region be built or torn down cleanly ([scopes](scopes) — a Key Vault exists per
tenant×region), and keeps the audit trail per-region too.

## 4 · Access is provisioned, never clicked

The grants themselves follow the platform's identity grammar ([Identity & PIM](identity-pim)):
the tenant's *contributors* group gets Secrets Officer via Terraform in the tenant provisioning
flow ([tenants](tenants)), humans PIM-activate, automation uses standing operator identities.
Nobody ever adds an access policy by hand — the vault's permission set is reviewable YAML like
everything else.

## 5 · What I'd tell a team adopting this

1. Decide vault placement **before** the first tenant exists — moving vaults later is misery.
2. Grant data-plane roles only; treat management-plane access as a platform escalation.
3. Make the vault's RG name boringly predictable — auditors will thank you.
4. Purge protection on, always. The pattern protects against deletion *by design*, but belts
   and suspenders.

## Related

[Key Vault](res-key-vault) · [Tenants](tenants) · [Identity & PIM](identity-pim) ·
[Build & scopes](scopes) · [✍️ all articles](blog-index)
