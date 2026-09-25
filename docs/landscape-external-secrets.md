# 🔑 External Secrets — Key Vault to cluster, without humans

> 💡 **TL;DR** — secrets live in the [per-tenant-per-region Key Vaults](blog-tenant-keyvaults)
> (platform-owned RG, remember); External Secrets Operator projects them into namespaces as
> native Kubernetes secrets. Nobody copies a secret by hand, nothing long-lived sits in git,
> and rotation in the vault IS rotation in the cluster.

## The job it does here

- **One `ClusterSecretStore` per tenant×region vault**, bound with workload identity — the
  operator authenticates federated, [no stored credential](blog-access-as-code).
- **`ExternalSecret` manifests live with the app** — declarative "I need `db-password` from
  my vault", synced and refreshed on an interval.
- **Rotation flows through**: rotate in Key Vault → operator refresh →
  [Reloader](landscape-reloader) rolls the pods. The human touches only the vault.

## What I'd tell you before adopting

1. Model stores per tenant, not one global store — the store IS your isolation boundary.
2. Set `refreshInterval` deliberately; "1h" is a rotation SLA you're signing.
3. Alert on sync failures — a stale secret fails much later than the sync did.

## Where it runs

`ns: external-secrets` · every cluster (`platform-services/base/`) · sync wave −2 · chart `external-secrets 0.12.1`
— pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. Placement is a
reviewed property of the cluster class, not a deploy-time decision: workloads reference ExternalSecret outputs on their first sync.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-external-secrets)

## Related

[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Reloader](landscape-reloader) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[One gateway, one login: SSO for every tenant route](blog-traefik-oauth) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Reloader — rotation that actually reaches pods](landscape-reloader)
