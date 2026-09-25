# 🦅 Falco — the third layer: catching what already got past the first two

> 💡 **TL;DR** — [Falco](https://falco.org/) (CNCF graduated) watches syscalls via eBPF and
> alerts on runtime behavior no admission policy or image scan can see: a shell spawned inside
> a container, a write to `/etc/shadow`, an unexpected outbound connection. [Kyverno](landscape-kyverno)
> stops the bad manifest at creation; [Trivy](landscape-trivy) flags the bad image; Falco is
> the layer that watches what a workload **actually does** once both of those already said yes.

## The job it does here

- **Runtime, not admission or build time.** A perfectly compliant pod can still get exploited
  at runtime — Falco is the detection layer for exactly that gap, completing the three-stage
  story: admission (Kyverno) → build (Trivy) → runtime (Falco).
- **Default rules encode real incidents, not guesses** — shell-in-container, sensitive-file
  writes, unexpected network connections. The rule set is a checklist of "how containers
  actually get compromised," maintained upstream instead of reinvented per platform.
- **Feeds the same alerting path as everything else.** Falco alerts route through
  [Policy Reporter](landscape-policy-reporter)/Grafana rather than a bespoke SIEM integration —
  one incident channel, not a new tool to watch.

## What I'd tell you before adopting

1. **Tune before you trust.** Default rules fire on legitimate platform behavior (debug
   `exec`, package installs during build) — a noisy Falco is an ignored Falco within a week.
2. **Runtime detection is not prevention.** Falco tells you fast, it doesn't stop anything by
   default — pair alerts with a response runbook or the signal has nowhere to go.
3. **eBPF has kernel-version edges.** Verify the driver/BPF probe against your node image
   before rollout; a failed probe means silent blind spots, not a visible error.

## Where it runs

`ns: falco` · every cluster (`platform-services/base/`) · sync wave 0 — pinned in
[`up-kubernetes`](kubernetes) `gitops/platform-services/`. A DaemonSet per node, watching the
kernel directly — no per-workload configuration required.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-falco)

## Related

[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Trivy — continuous vulnerability scanning](landscape-trivy) ·
[Defense in depth — no single wall, because walls fall](blog-defense-in-depth) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Policy Reporter — one dashboard for every policy engine](landscape-policy-reporter) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy)
