# 🧪 Litmus — chaos as a reviewed experiment, never a surprise

> 💡 **TL;DR** — [LitmusChaos](https://litmuschaos.io/) (CNCF incubating) injects controlled
> failure — pod kills, network latency, resource starvation — to prove resilience claims
> instead of hoping them. Nothing runs by default: every experiment is a `ChaosEngine` CRD,
> reviewed like any other change, scoped to a namespace. Same governance instinct as
> [the OPA gate](security-opa) and [Kyverno](landscape-kyverno) — the dangerous thing is
> explicit and auditable, never ambient.

## The job it does here

- **Turns "should survive a node loss" into a test.** [Karpenter](landscape-karpenter)
  consolidation and PDBs are *claims* about resilience — a scheduled pod-kill experiment is
  how you find out before an actual node loss does.
- **Targets one blast radius at a time.** A `ChaosEngine` names its target namespace and
  workload explicitly — the same tenant-isolation discipline [RBAC](blog-tenant-isolation)
  already enforces, applied to fault injection instead of access.
- **Turns on-call folklore into a runbook.** "We think we handle a dependency timeout" becomes
  a repeatable experiment with a pass/fail result — feeding real gaps into the
  [runbook set](runbook-drift-response), not just a war story.
- **The flagship experiment guards the scariest shared-fate zone.**
  `up-gateway/chaos/gateway-pod-kill.yaml` kills [the ONE gateway's](landscape-traefik) pods
  every 20 s for two minutes while a **Continuous httpProbe** asserts the status page keeps
  answering *through* the gateway — the PDB and zone-spread replicas are the hypothesis, the
  probe is the proof. See [failure modes](failure-modes) for how this renders in the map.

## What I'd tell you before adopting

1. **Opt-in only, always.** No experiment runs without an explicit, reviewed `ChaosEngine` —
   ambient chaos in a shared cluster is an incident generator, not a practice.
2. **Start in sandbox, graduate deliberately.** Prove the experiment's blast radius stays
   contained before it ever targets a live namespace.
3. **A chaos experiment without a hypothesis is just an outage.** Write down what you expect
   to happen and what "pass" means *before* running it, or the result teaches nothing.

## Where it runs

`ns: litmus` · every cluster (`platform-services/base/`) · sync wave 1 (after the platform's
other controllers are stable — chaos targets a settled system, not one still converging) —
pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`. The **operator** is
always-on; **experiments** are zero by default until someone reviews one in.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-litmus)

## Related

[Karpenter — just-in-time, right-sized nodes](landscape-karpenter) ·
[A 403 is usually the fence doing its job](blog-tenant-isolation) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

["What happens when it dies?" is the whole architecture review](blog-failure-modes) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Karpenter — just-in-time, right-sized nodes](landscape-karpenter) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik) ·
[OPA / rego — infrastructure can't change unless policy says it may](security-opa)
