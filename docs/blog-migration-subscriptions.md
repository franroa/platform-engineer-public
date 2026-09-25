# 🔀 Moving a platform between Azure subscriptions

> 💡 **TL;DR** — subscription-to-subscription moves are the migration nobody plans for:
> same cloud, same code, different boundary. The platform's
> [scope model](blog-terraform) is what makes them survivable — when every resource has an
> owning repo and a state file, "move" decomposes into: recreate the scope in the target,
> shift the *pointers* (state, identity, DNS, peering), and let terraform prove the two
> worlds equal before anything flips.

## 1 · Why these moves happen

Sector splits (our `ultracore` / `ultraapps` [subscriptions](global-footprint) exist for
blast-radius and billing), EA-to-MCA commercial changes, or landing-zone re-parenting.
`az resource move` exists but it lies to you at scale: half the resource types can't move
(AKS among them), and what does move arrives with its history, quirks and IAM intact —
which is precisely what you were trying to clean up.

## 2 · Recreate-and-repoint beats move

1. **Stand the scope up in the target** from the same modules — a subscription is
   *config* to the platform ([scopes, tiers](blog-terraform)), so this is a plan/apply,
   not archaeology.
2. **State surgery where identity persists**: `terraform state mv` / `import` for the few
   truly shared things; everything else is born fresh.
3. **Repoint the connective tissue** — the real work: VNet peerings to
   [the hub](network-hub-spoke), private DNS links, workload-identity federations, the
   [Key Vault references](blog-tenant-keyvaults), CI's `ARM_SUBSCRIPTION_ID` deploy vars.
4. **Dual-run and diff**: both subscriptions live side by side; the
   [security inventory](blog-terraform) and the live map diff them until the delta is
   only intentional.
5. **Flip at the edges** (DNS, peering) — and keep the old subscription readable until
   the starvation clock runs out.

## 3 · What I'd tell you

The moves that hurt are the ones where identity is IN the moving scope: managed identities
and federated credentials do not travel, and every consumer holding the old client ID
fails at its own pace. Inventory the identity edges first — the compute is the easy part.

## Related

[From on-premises to cloud](blog-migration-onprem-cloud) · [Terraform at scale](blog-terraform) ·
[✍️ all articles](blog-index)
