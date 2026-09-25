# Build an App — from an empty region to a running service

This is the whole platform, told as a **creation story**. Use the **Next ▶** button to descend the nested boxes one scope at a time: **Region → Cluster → Tenant → App**. Each level explains *what gets created* and *who is responsible*.

---

## 1 · Azure Region  *(scope: region · owner: Cloud + Platform)*

**Creates:** resource groups (`hub-eu01`, spoke RGs), the **hub VNet** (Gateway/Bastion subnets) and **spoke VNets** with subnets/NAT/NSGs, regional **DNS** zones, **flow logs**, and — in `eu01` — the **P2S VPN gateway**.

**Change:** a new region becomes a peered part of the hub-and-spoke network, reachable through the one VPN door.

**Responsibility:** *Platform* provisions the network (`up-network`); *Cloud (Azure)* provides the region and availability zones.

---

## 2 · AKS Cluster  *(scope: region · owner: Platform)*

**Creates:** the **AKS control plane**, **node pools** (system / gitlab / gen, Guaranteed QoS) and the **platform services** on top — cert-manager, the ALB/AGfC ingress controller, the Azure Policy add-on and observability agents.

**Change:** the region can now run workloads, with ingress + WAF + metrics/logs ready.

**Responsibility:** *Platform* owns the cluster and its core services (`up-kubernetes`); *Cloud* manages the control-plane substrate.

---

## 3 · Tenant  *(scope: tenant, some per tenant-region · owner: Platform + Tenant)*

**Creates:** the tenant's **AD groups + PIM** (admins/contributors/operators/readers, per tier), a **tenant resource group** *per region*, a **namespace** on that region's cluster with RBAC, and — importantly — a **Key Vault per tenant-region in a *separate*, platform-owned resource group** (see *Resources & Scopes*).

**Also unlocked here:** the tenant can now consume the platform's **reusable libraries** — **Terraform modules** (`up-modules`) and **Helm charts** (`up-helm-charts`) — plus the **GitLab components** for its pipelines. It doesn't build infra or deployments from scratch; it composes these.

**Change:** a team has a least-privilege, isolated home — standing automation identities, PIM for humans, isolated secrets.

**Responsibility:** *Platform* owns the guardrails (KV isolation, RBAC, namespaces, modules/charts/components, OPA policies); *Tenant* owns its membership and the resources inside its own RG.

---

## 4 · App  *(scope: app · owner: App / Tenant)*

**Creates:** the app repo composes the three libraries —
- `.gitlab-ci.yml` **includes the GitLab component** (`terraform-tenant-deploy` → plan → OPA → apply),
- `infra/main.tf` **uses Terraform modules** → a database, and its **secrets written into the tenant-region Key Vault**,
- `chart/Chart.yaml` **depends on platform Helm charts** → Deployment/Service/HTTPRoute in the tenant namespace.

**Change:** the service is live in the tenant namespace, behind ingress + WAF, observable — and every change flows through the same policy-gated, secretless pipeline.

**Responsibility:** *App team* owns the app code, container image, `values.yaml` and module inputs; *Platform* owns the modules/charts/components/policies; *Cloud* runs it.

---

## 5 · Publish Path  *(scope: cluster + tenant · owner: Platform + Tenant)*

**Creates:** nothing new per app — the cluster already runs **ONE shared Traefik gateway** (ns `gateway`, sync wave −1, owned by `up-gateway`). The tenant attaches an **HTTPRoute in its own namespace** (a `parentRef` to the shared gateway) that targets the pod's **oauth2-proxy sidecar on :4180** — never the app port.

**Change:** the service has exactly one login door. The Service only exposes :4180, so traffic *cannot* skip SSO; a route pointing at the app port shows up as **drift**, not as an open door.

**Responsibility:** *Platform* owns the one gateway and its class; *Tenant* owns its routes and its per-tenant OIDC client (delivered via External Secrets). A second gateway is a design smell, not a scaling move — see [One gateway, one login](blog-traefik-oauth).

---

## 6 · Shared Responsibility

Put together, three parties own three layers — see *Shared Responsibility*:

- **Cloud (Azure)** — regions/AZs, the managed AKS control plane, the identity substrate, physical infra.
- **Platform** — network, clusters + core services, tenancy + **Key Vault isolation** + RBAC, the reusable **modules / components / charts**, OPA policies, observability.
- **App / Tenant** — app code, images, `values.yaml`, module inputs, their data, their membership.

Nobody re-implements another layer's job. That's what makes it scale.

## ✍️ Related writing

[The golden path is three files, not a wiki page](blog-golden-path)
