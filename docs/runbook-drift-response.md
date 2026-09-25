# 🚨 Runbook — cloud-vs-code drift triage

> 💡 **TL;DR** — the drift feed (the ⚠ badge on the [map](ultraplatform.html)) says the cloud
> and the code disagree: something was **added** in the portal, **changed** past its declared
> bounds, or **removed** while still declared. Drift is not automatically an incident — but it
> is always a decision: *adopt it into code, or revert it in the cloud.* The one wrong answer
> is leaving it unexplained.

| Property | Value |
| --- | --- |
| **Severity when firing** | judge by resource class — security-relevant drift (NSG, RBAC, WAF) is high |
| **Owning view** | the view that owns the drifted resource (the drift entry names the region + resource) |
| **Signal** | the map's live-drift badge · the deploy pipeline's plan diff refusing to be empty |

## 🧭 Triage (10 minutes)

1. **Read the drift entry.** Each one carries region · resource · kind (added / changed /
   removed) · detail. That tells you the owning repo immediately (e.g. an NSG rule → the
   network repo; a node count → the nodepools repo).
2. **Security first.** An *added* NSG/firewall rule, RBAC grant or WAF exclusion that nobody
   declared is treated as an incident until shown otherwise — check the activity log for who
   made it and when, before touching it.
3. **Understand why before choosing a direction:**
   - **Portal hotfix during an incident** → usually *adopt*: replay it as code in the owning
     repo, merge, and let the pipeline converge. The hotfix was right; its location was wrong.
   - **Autoscaler / platform-managed value above the declared bound** → *fix the declaration*
     (raise the bound or mark the attribute ignored) — the code was lying about reality.
   - **Experiment someone forgot** → *revert in cloud*: run the owning pipeline; apply
     restores the declared state.

## 🔧 Recover

- Adopt: change in the owning repo → MR → the standard **plan → OPA gate → apply** pipeline.
- Revert: re-run the owning repo's deploy pipeline; a clean plan-and-apply IS the revert.
- Either way the drift entry disappears on the next sync — an entry that survives your fix
  means you fixed a different resource than the feed was pointing at.

## 🧯 Afterwards

- If the drift was security-relevant, write the timeline down while it's fresh (who, what,
  when, why) — the [security inventory](security-opa.md) review consumes these.
- Repeat offenders (the same resource drifting monthly) are a design smell: the declared
  bound is wrong, or a human keeps needing a knob the platform should expose properly.

## ✍️ Related writing

[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus) ·
[Policy Reporter — one dashboard for every policy engine](landscape-policy-reporter) ·
[Trivy — continuous vulnerability scanning, not just a build-time gate](landscape-trivy) ·
[OPA / rego — infrastructure can't change unless policy says it may](security-opa)
