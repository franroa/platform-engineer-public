# 🛡️ Trivy — continuous vulnerability scanning, not just a build-time gate

> 💡 **TL;DR** — [Trivy Operator](https://aquasecurity.github.io/trivy-operator/) scans every
> running workload's images (and cluster config) *in the cluster*, on a schedule — so a CVE
> disclosed the day after a deploy is caught, not just the CVE that existed at build time.
> Findings land as `VulnerabilityReport`/`ConfigAuditReport` CRDs, the same
> [PolicyReport](landscape-policy-reporter) shape Kyverno already emits, so one dashboard covers
> both.

## The job it does here

- **Closes the gap the CI gate can't.** [The pre-baked CI toolchain image](gitlab-runners) and
  its scan gate catch CVEs known *at build time* — Trivy Operator re-scans the images already
  running, on a schedule, so a CVE published next week against last month's build still surfaces.
- **Cluster config, not just images.** `ConfigAuditReport` flags the same class of issue
  [Kyverno](landscape-kyverno) prevents at admission (privileged containers, missing resource
  limits) — a second, continuous check against drift in workloads Kyverno saw once at creation.
- **Answers the drift runbook's first question fast.** ["Which cluster is still running the bad
  digest?"](runbook-drift-response) becomes a `VulnerabilityReport` query across clusters instead
  of a kubectl loop through every region by hand.

## What I'd tell you before adopting

1. Scanning is noisy on day one — **triage by severity + exploitability**, not raw count, or
   the first dashboard becomes the last dashboard anyone opens.
2. Continuous scanning duplicates the CI-time scan's coverage on images that never change — the
   value is entirely in **re-scanning without a new deploy**, so tune the schedule to that, not
   to "as often as possible."
3. Pair it with [Policy Reporter](landscape-policy-reporter) from day one — a report nobody
   aggregates is a report nobody reads.

## Where it runs

`ns: trivy-system` · every cluster (`platform-services/base/`) · sync wave 0 — pinned in
[`up-kubernetes`](kubernetes) `gitops/platform-services/`. Each cluster scans its own workloads;
findings surface through [Policy Reporter](landscape-policy-reporter) and the
[Grafana](landscape-grafana) hub.

[**▶ See it in the cluster**](#aks=eu01&d=landscape-trivy)

## Related

[Policy Reporter — one dashboard for every policy engine](landscape-policy-reporter) ·
[Kyverno — safe namespaces by default](landscape-kyverno) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Falco — the third layer: catching what already got past the first two](landscape-falco) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Kyverno — safe namespaces by default](landscape-kyverno) ·
[Policy Reporter — one dashboard for every policy engine](landscape-policy-reporter)
