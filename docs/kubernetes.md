# Kubernetes (AKS) — the compute plane

> Repos: `up-kubernetes`, `up-nodepools`, `up-namespaces`, `up-crds`

Workloads run on **Azure Kubernetes Service (AKS)**, provisioned as Terraform in a strict three-stage order: **cluster → nodes → services**. Each stage is a separate module so its lifecycle and blast radius are independent.

## The three stages

```
1. cluster   → the AKS control plane + core networking, per (domain, tier, region)
2. nodes     → node pools (sizes, autoscaling, taints) — the capacity
3. services  → platform add-ons via Helm/Terraform:
               cert-manager, ALB controller (AGfC), ingress, policy add-on, …
```

The `services` stage has intra-stage ordering too — e.g. `cert-manager` and the ALB controller are applied first (targeted), because everything else depends on certificates and ingress existing.

## After the seed: the GitOps landscape

Terraform installs exactly two in-cluster things — **Argo CD** and **cert-manager**. From
there [the CNCF landscape](landscape-index) arrives declaratively via two app-of-apps roots
in `up-kubernetes/gitops/`:

- `platform-root.yaml` → `platform-services/` — the landscape itself, **sync-waved**
  ([Kyverno](landscape-kyverno) webhooks at −2, before any workload) and placed by
  **cluster class**: `base/` everywhere, `hub/` (Grafana, Backstage) in eu01 only,
  `sandbox/` (Telepresence) never in live.
- `root-app.yaml` → `up-namespaces` — tenant workloads. `tenant:` names the owner, or
  `shared` for platform-owned multi-tenant services. The diagram draws these as two bands:
  **shared services** (one deployment serves every tenant) and **tenant namespaces**
  (colored by owning tenant).

## Why split cluster / nodes / services?

- **Different change rates.** The control plane is stable; node pools change with capacity needs; services change most often. Separate modules mean a routine add-on bump never re-plans the whole cluster.
- **Targeted recovery.** You can rebuild node pools without touching the control plane, or reinstall a service without risking the cluster.
- **Guarantees for CI.** Node pools are shaped so CI/CD build pods get a **Guaranteed** QoS (CPU and memory *requested = limited*), so jobs aren't CFS-throttled or evicted under pressure.

## CRDs: the plan-time gotcha

`up-crds` (and some observability modules) manage **CustomResourceDefinitions** whose YAML is extracted from Helm chart packages. Because Terraform evaluates `file()`/`fileset()` at **plan time**, those files must exist on disk *before* plan runs — so these modules **must** be driven through their `Taskfile` (`task plan` / `task apply`), which downloads and extracts the chart first. Running raw `terraform` against them can silently destroy CRDs.

## Pseudocode: bring up a cluster

```
apply(cluster,  domain, tier, region)
apply(nodes,    domain, tier, region)
apply(services, target = cert_manager)          # certs first
apply(services, target = alb_controller.helm)   # then ingress
apply(services)                                 # then the rest
```

## ✍️ Related writing

[You can't SSH into production — that's the feature](blog-immutability) ·
[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[Instrumentation as a platform default — the OpenTelemetry Operator](blog-otel-operator) ·
[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Twelve-Factor isn't a checklist — it's what the platform makes free](blog-twelve-factor) ·
[Argo CD — the cluster state is a repo](landscape-argocd) ·
[Backstage — the developer portal](landscape-backstage) ·
[Cloud Native Buildpacks — images without Dockerfiles](landscape-buildpacks) ·
[Cilium — the CNI, chosen at cluster creation, not GitOps'd in later](landscape-cilium) ·
[Dapr — building-block APIs a sidecar gives every language](landscape-dapr) ·
[External DNS — records follow the routes](landscape-external-dns) ·
[External Secrets — Key Vault to pods, no humans](landscape-external-secrets) ·
[Falco — the third layer: catching what already got past the first two](landscape-falco) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Karpenter — just-in-time, right-sized nodes](landscape-karpenter) ·
[KEDA — scale on real signals](landscape-keda) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus) ·
[OpenCost — cost allocation, per tenant, per namespace](landscape-opencost) ·
[OpenFeature — decouple the deploy from the release](landscape-openfeature) ·
[OpenTelemetry — instrument once, everywhere](landscape-opentelemetry) ·
[Policy Reporter — one dashboard for every policy engine](landscape-policy-reporter) ·
[Reloader — rotation that actually reaches pods](landscape-reloader) ·
[Telepresence — debug the real cluster, safely](landscape-telepresence) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy)
