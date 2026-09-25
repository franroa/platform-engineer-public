# Shared Responsibility — Cloud · Platform · App

The platform only scales because **each layer owns a clear slice** and nobody re-implements another layer's job. Three parties, three responsibilities.

```
┌──────────────────────────────────────────────────────────────┐
│  APP / TENANT                                                  │
│  app code · container image · values.yaml · TF module inputs   │
│  its data · tenant membership                                  │
├──────────────────────────────────────────────────────────────┤
│  PLATFORM                                                      │
│  network (hub-spoke, VPN) · AKS clusters + core services       │
│  tenancy: RBAC · namespaces · Key Vault isolation (separate RG)│
│  reusable libraries: Terraform modules · GitLab components ·   │
│  Helm charts · OPA/rego policies · observability               │
├──────────────────────────────────────────────────────────────┤
│  CLOUD (Azure)                                                 │
│  regions / availability zones · managed AKS control plane      │
│  managed-identity substrate · physical infra & durability      │
└──────────────────────────────────────────────────────────────┘
```

## Cloud (Azure) — the ground

- Physical regions and availability zones.
- The **managed** AKS control plane (Azure runs the masters).
- The identity substrate (Entra ID, managed identities, OIDC federation).
- Durability and availability of the underlying services.

You don't manage these — you consume them.

## Platform — the paved road

- **Network:** the hub-and-spoke topology and the single VPN door.
- **Clusters:** AKS node pools + the core services (ingress/WAF, cert-manager, policy add-on, observability agents).
- **Tenancy & isolation:** RBAC, PIM, namespaces, and the **Key Vault-per-tenant-region in a separate, platform-owned resource group**.
- **The reusable libraries — the heart of it:** **Terraform modules**, **GitLab CI components**, **Helm charts**, and the **OPA/rego policies** that gate every deploy.

The modules, components and charts are **part of the platform**, not the app. An app *composes* them; it doesn't own or copy them.

## App / Tenant — the last mile

- App code and the container image.
- `values.yaml` and the **inputs** to platform Terraform modules.
- The app's own data.
- Who is in the tenant's groups.

## Why draw the line here

- **Least privilege by construction.** A tenant can use secrets but not delete the vault; run pipelines but not bypass the OPA gate; deploy but not touch the cluster's core services.
- **One place to fix.** A security or best-practice change lands in a platform module/component/chart/policy and every app inherits it on the next version bump.
- **Speed.** App teams write only the last mile; everything below is a paved road.

See *Build an App* for how these three come together, scope by scope.
