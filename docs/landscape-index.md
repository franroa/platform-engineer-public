# 🗺️ The landscape — CNCF & friends I actually run

> 💡 **TL;DR** — not a logo wall: every tool here runs in the platform today, earns its
> place, and has a note explaining *what job it does for us* and *what I'd tell you before
> adopting it*. The stack is deliberately boring — well-worn projects wired together by
> [the golden path](blog-golden-path), not novelty.

The selection rule is simple: a tool joins the platform when it removes a class of toil for
every tenant at once, and it must be operable by a small team. Each entry links its note:

| Tool | The job it does here |
| --- | --- |
| [Helm](landscape-helm) | the packaging grammar — one chart library, consumed everywhere |
| [Argo CD](landscape-argocd) | GitOps delivery — the cluster state is a repo, not a memory |
| [Kyverno](landscape-kyverno) | in-cluster policy — the runtime half of the policy gate |
| [External Secrets](landscape-external-secrets) | Key Vault → Kubernetes secrets, without humans |
| [Reloader](landscape-reloader) | config changes actually reach running pods |
| [External DNS](landscape-external-dns) | DNS records follow the ingresses that need them |
| [KEDA](landscape-keda) | scaling on real signals — queues and events, not just CPU |
| [OpenTelemetry](landscape-opentelemetry) | one instrumentation standard for every tenant |
| [Telepresence](landscape-telepresence) | debug against the real cluster from the laptop |
| [Karpenter](landscape-karpenter) | just-in-time, right-sized nodes — provisioned in seconds, consolidated when idle |
| [Grafana](landscape-grafana) | one pane over the telemetry — dashboards, alerts and Explore as code |
| [Backstage](landscape-backstage) | the developer portal — software catalog, scaffolder and TechDocs |
| [Cloud Native Buildpacks](landscape-buildpacks) | images without Dockerfiles — one hardened builder, no per-repo drift |
| [cert-manager](res-cert-manager) | certificates as a controller — TLS issued and renewed automatically |
| [Trivy](landscape-trivy) | continuous vulnerability scanning — CVEs found after deploy, not just at build |
| [Policy Reporter](landscape-policy-reporter) | one dashboard for every policy engine's reports |
| [OpenCost](landscape-opencost) | cost allocation, per tenant, per namespace — the bill made visible |
| [OPA / rego](security-opa) | infrastructure can't change unless policy says it may |
| [Falco](landscape-falco) | runtime security — the third layer, after admission and build |
| [Litmus](landscape-litmus) | chaos as a reviewed experiment, never ambient |
| [OpenFeature](landscape-openfeature) | decouple the deploy from the release |
| [Cilium](landscape-cilium) | the eBPF CNI — L3-L7 network policy and Hubble visibility |
| [Dapr](landscape-dapr) | sidecar building blocks — pub/sub, state, durable workflow |
| [Traefik](landscape-traefik) | the shared service gateway — ONE instance, every tenant's routes |

## Where it all runs

Every service is GitOps-delivered from [`up-kubernetes`](kubernetes)
`gitops/platform-services/`, sync-waved so policy lands before workloads, and placed by
**cluster class** — a reviewed property, not a deploy-time decision:

| Class | Runs | Services |
| --- | --- | --- |
| `base/` | every cluster | cert-manager + ALB/AGfC (services stage, before GitOps) · Argo CD (−3) · Kyverno, External Secrets, Karpenter (−2) · External DNS, KEDA, Reloader, OTel Collector, OpenFeature, Dapr, Traefik (−1) · Trivy, OpenCost, Policy Reporter, Falco (0) · Litmus (1) |
| `hub/` | eu01 only | Grafana, Backstage, Cloud Native Buildpacks (kpack) — one pane, one catalog, one builder, not one per region |
| `sandbox/` | sandbox clusters | Telepresence — laptop intercepts never touch live |

Helm and Cilium are the deliberate exceptions: Helm has no controller in the cluster (charts
are OCI artifacts Argo CD renders server-side); Cilium isn't GitOps'd in at all — it's the
CNI, chosen in the `cluster` Terraform module before any of this exists. OPA runs in the CI
job that plans the change, not in the cluster either — it's the one entry here with no
`ns:` of its own. [**▶ See the landscape in the cluster**](#aks=eu01).

## Related

[The golden path](blog-golden-path) · [Three libraries, one platform](blog-reuse-libraries) ·
[Multi-tenant Kubernetes](blog-kubernetes)

## ✍️ Related writing

[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Well-architected is a set of questions, not a badge](blog-well-architected) ·
[Argo CD — the cluster state is a repo](landscape-argocd) ·
[Backstage — the developer portal](landscape-backstage) ·
[Cloud Native Buildpacks — images without Dockerfiles](landscape-buildpacks) ·
[Cilium — the CNI, chosen at cluster creation, not GitOps'd in later](landscape-cilium) ·
[Dapr — building-block APIs a sidecar gives every language](landscape-dapr) ·
[External DNS — records follow the routes](landscape-external-dns) ·
[External Secrets — Key Vault to pods, no humans](landscape-external-secrets) ·
[Falco — the third layer: catching what already got past the first two](landscape-falco) ·
[Grafana — one pane, run once](landscape-grafana) ·
[Helm — the packaging grammar](landscape-helm) ·
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
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy) ·
[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager) ·
[OPA / rego — infrastructure can't change unless policy says it may](security-opa)
