# ☸️ Multi-tenant Kubernetes without the foot-guns

> 💡 **TL;DR** — tenancy is a *contract*, not a namespace: identity (AD groups + PIM), a
> namespace per cluster, dedicated node pools, and data services the tenant can use but **not
> delete**. All of it declared in code, so onboarding a tenant is a merge request, not a
> ticket.

## The contract, layer by layer

1. **Identity first.** A tenant starts as AD groups with [PIM](identity-pim) — membership *is*
   the access grant. Default permissions come from the tenants repo (one `config/<tenant>.yml`:
   members, owners); anything beyond defaults is an explicit, reviewable role assignment in the
   identity repo. Two files, two blast radii.
2. **A [namespace](res-namespace) per tenant per cluster — declared, not clicked.** Namespace
   files state which clusters they deploy to (`clusters: [k8s-<sector>-<stage>-<region>]`), so
   "where does this app run" is a `git grep`, and this map's AKS view renders it live.
3. **[Node pools](res-node-pools) split system from workload.** System pods and CI runners never
   fight tenant workloads for CPU; Guaranteed QoS on the pools that matter.
4. **Data lives where tenants can't break it.** The tenant's [Key Vault](res-key-vault),
   [Storage](res-storage-account) and [PostgreSQL](res-postgresql) sit in a **separate,
   platform-owned resource group** — reachable only via [private endpoints](res-private-endpoint),
   usable by the tenant, deletable only by the platform. This single decision has prevented more
   incidents than any admission controller.
5. **One way in, one way out.** Ingress is the platform's [ALB + WAF](res-ingress-waf) via
   [HTTPRoute](res-httproute); humans come through [the VPN](vpn). No tenant-managed
   LoadBalancers, no public API servers.

## Why "as code" is the point

Every layer above is a file in a repo with an owner and a pipeline:

- tenant onboarding = one YAML in the tenants repo → groups, RG, namespaces, defaults;
- app deployment = a [Helm release](res-helm-release) composed from the platform's
  [chart library](up-helm-charts) — apps ship a `values.yaml`, not 400 lines of manifests;
- the guardrails (quotas, network policy, WAF attach) ride inside the charts and the cluster
  services, so tenants inherit them by construction.

The alternative — tenancy by portal clicks — rots in weeks and audits in tears.

## Failure modes this design prevents

| Without | With |
| --- | --- |
| tenant deletes "their" Key Vault, platform restores from panic | KV in platform-owned RG — deletion isn't in the tenant's power |
| mystery workloads on system nodes | dedicated pools, Guaranteed QoS |
| "who has access to prod?" takes a meeting | membership file + PIM audit log |
| every app invents ingress | one ALB/WAF, HTTPRoute per app |

## Related

[Kubernetes view](kubernetes) · [Tenants](tenants) · [Identity & PIM](identity-pim) ·
[Example app](example-app) · [✍️ all articles](blog-index)
