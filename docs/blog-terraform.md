# 🏗️ Terraform at scale — scopes, tiers and a policy gate

> 💡 **TL;DR** — the platform survives dozens of repos and four regions because every resource
> has exactly **one scope** (region / cluster / tenant / tenant×region / app), every scope has
> exactly **one owning repo**, and every `apply` passes an **OPA gate**. Structure first,
> automation second — the other order doesn't scale.

## 1 · One scope per resource

The single most useful question in platform Terraform is not "how do I create X" but
"**how many of X exist, per what?**" A [VNet](res-vnet) exists per region. An
[AKS cluster](res-aks) exists per region. A [namespace](res-namespace) exists per tenant per
cluster. A [Key Vault](res-key-vault) exists per tenant×region. Get this wrong and you get the
classic failure: a "shared" resource created inside an app repo, destroyed by an app teardown.

The map's *Build & scopes* view is literally this table, drawn. Each scope column names its
owning repo — [repos by level](repos-by-level) — and each resource note states its scope in the
properties table.

## 2 · Repos as tiers, ordered by dependency

Network before cluster, cluster before tenant, tenant before app. The
[hub-and-spoke deep dive](network-hub-spoke) documents the deploy order inside the network repo
itself (`global → dns → hub → flowlogs → peering`) — the same principle, one level down.
Dependency direction is enforced socially and structurally: lower tiers **never** reference
higher tiers, and higher tiers consume lower tiers only through remote state and versioned
[Terraform modules](terraform-modules) (`source = …?ref=v2.3.0`), never by path.

## 3 · The policy gate makes `apply` boring

Every pipeline is `plan → OPA → apply` ([Security & OPA](security-opa)). The rego packs encode
the platform's non-negotiables: no public IPs on data services, no
[subnet](res-subnet) without an [NSG](res-nsg), `prevent_destroy` on the
[VPN gateway](res-vpn-gateway) tier, tags that route cost. A denied plan fails in CI with the
violated rule's name — the reviewer argues with a policy, not a person.

Two design choices matter more than the tool:

- **Policies live centrally** (one policy repo), pipelines *include* them via a shared CI
  component — so a new rule ships to every repo without touching any repo.
- **The gate sees the plan, not the code** — it evaluates what would actually change, which is
  the only honest input.

## 4 · What I'd tell a team starting today

1. Write the scope table before the first module.
2. Make module versions the *only* coupling between tiers.
3. Add the OPA gate on day one with three rules; grow it from incidents.
4. Deploy variables are part of the interface — name them, list them, review them
   (this map's live companion inventories exactly that per repo).

## Related

[Build & scopes](scopes) · [Terraform modules](terraform-modules) ·
[Hub-and-spoke deep dive](network-hub-spoke) · [Security & OPA](security-opa) ·
[✍️ all articles](blog-index)
