# 📋 Policy Reporter — one dashboard for every policy engine

> 💡 **TL;DR** — [Policy Reporter](https://kyverno.github.io/policy-reporter/) reads the
> `wgpolicyk8s.io` `PolicyReport`/`ClusterPolicyReport` CRDs that [Kyverno](landscape-kyverno)
> and [Trivy](landscape-trivy) already emit, and turns them into one UI + Slack/Teams alerts —
> so "did admission policy actually catch anything, and did the scanner find anything" is a
> dashboard, not two separate `kubectl get policyreport` habits nobody remembers to run.

## The job it does here

- **A standard, not a custom exporter.** Because Kyverno and Trivy both emit the same
  `wgpolicyk8s.io` report shape, Policy Reporter aggregates them without either tool knowing the
  other exists — the standard is what makes [adding Trivy](landscape-trivy) a dashboard update,
  not an integration project.
- **Turns audit-mode Kyverno into a worklist.** A Kyverno policy in `audit` mode records
  violations without blocking anything — useful for rolling out a new rule safely, but only if
  someone can see what it would have blocked. Policy Reporter is that visibility.
- **Notifications, not polling.** Slack/Teams targets mean a new `ClusterPolicyReport` violation
  or a fresh critical `VulnerabilityReport` pages the right channel instead of waiting for
  someone to open a dashboard.

## What I'd tell you before adopting

1. Decide **audit vs enforce** per policy deliberately — Policy Reporter makes `audit` mode
   genuinely useful (you can *see* the near-misses), so there's less pressure to jump straight
   to `enforce` before you trust a new rule.
2. Alert fatigue is the real risk — route by **severity**, not by "every report," or the
   channel gets muted within a week.
3. It's a read model over reports **other tools already generate** — it adds no policy of its
   own, so the value is entirely in what's feeding it (this is why it's paired with
   [Trivy](landscape-trivy) here, not deployed alone).

## Where it runs

`ns: policy-reporter` · every cluster (`platform-services/base/`) · sync wave 0 (after
[Kyverno](landscape-kyverno) and [Trivy](landscape-trivy), the sources it reads from) — pinned
in [`up-kubernetes`](kubernetes) `gitops/platform-services/`.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-policy-reporter)

## Related

[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Trivy — continuous vulnerability scanning](landscape-trivy) ·
[cloud-vs-code drift triage](runbook-drift-response) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[Cost governance is three verbs: estimate, meter, standardize](blog-finops-governance) ·
[Falco — the third layer: catching what already got past the first two](landscape-falco) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy)
