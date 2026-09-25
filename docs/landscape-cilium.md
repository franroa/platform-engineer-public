# 🐝 Cilium — the CNI, chosen at cluster creation, not GitOps'd in later

> 💡 **TL;DR** — [Cilium](https://cilium.io/) (CNCF graduated) is the eBPF-based CNI running
> underneath every cluster — **Azure CNI powered by Cilium**, an AKS-native option set at
> cluster creation, not a Helm chart installed after the fact. It replaces iptables-based
> networking with eBPF, and turns two separate problems — L3/L4 network policy and L7
> traffic visibility — into one dataplane's job.

## The job it does here

- **A cluster property, not an app.** Unlike everything else in [the landscape](landscape-index),
  Cilium is chosen in the `network_dataplane` field of the AKS `cluster` module — the first of
  [Kubernetes's three provisioning stages](kubernetes) — so it exists before nodes or services
  do. There's no GitOps Application for it because there's no "installing" it after the fact.
- **NetworkPolicy with teeth.** eBPF enforcement means L3/L4 (and with Cilium, L7 HTTP-aware)
  network policy at line rate — a second, workload-native enforcement point alongside the
  [NSGs](res-nsg) that already fence the VNet at the infrastructure layer.
- **Hubble: the L7 view NSG flow logs can't give you.** Service-to-service traffic, per-request
  visibility, DNS-aware flows — feeding the same [Grafana](landscape-grafana) hub as every
  other signal, but at a layer Azure's own network telemetry doesn't reach.

## What I'd tell you before adopting

1. **It's a day-0 decision, not a day-2 upgrade.** Changing CNI on a live cluster means
   rebuilding it — decide at the `cluster` stage, in the same review that sets region and
   tier, not after workloads exist.
2. **NetworkPolicy is still opt-in enforcement.** Cilium makes policies fast and L7-aware; it
   doesn't write them for you — pair with [Kyverno](landscape-kyverno) generating sane
   namespace-default policies, the same way it seeds other namespace defaults.
3. **Don't duplicate the NSG's job at this layer.** NSGs fence the VNet/subnet; Cilium fences
   pod-to-pod inside it. Confusing the two layers means gaps at the seam, not extra safety.

## Where it runs

Configured in the AKS `cluster` Terraform module (`up-kubernetes`) as the platform's CNI —
every cluster, from creation, no sync wave (it exists before GitOps starts). Hubble's
observability data flows into the standard [Grafana](landscape-grafana) hub.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-cilium)

## Related

[Kubernetes (AKS) — the compute plane](kubernetes) · [Network Security Group](res-nsg) ·
[Grafana — one pane, run once](landscape-grafana) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno)
