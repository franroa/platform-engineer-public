# 💸 The cheapest cost review happens before the merge

> 💡 **TL;DR** — a billing review three weeks after the merge is archaeology, not governance.
> The place to see a cost is the **pull request that creates it**: Infracost diffs the price of
> the Terraform change against the base branch and comments the delta; OpenCost tells you what
> the running cluster *actually* costs so the estimate stays honest. Static estimate at plan
> time, dynamic truth at runtime — the same shift-left move the [OPA gate](security-opa) made
> for safety, applied to money.

## 1 · Reactive FinOps is a lost argument

By the time the invoice lands, the architecture shipped, the team moved on, and the
conversation is "who approved this?" — punitive and pointless. The fix is the same one that
worked for security: stop reviewing outcomes and start **gating changes**. A cost delta in the
MR is feedback while the decision is still cheap to change.

## 2 · Two tools, two halves of the truth

- **Infracost** is *static* analysis: it prices the Terraform plan. In the
  [component pipeline](gitlab-components) it slots in exactly where the OPA check does —
  `plan → price → gate → apply` — and comments the estimate on the MR. A change that adds
  €400/month says so, in the diff, before review.
- **[OpenCost](landscape-opencost)** is *dynamic* truth: what the namespaces actually consume
  once deployed. It's the feedback loop that keeps estimates honest — an estimate nobody
  reconciles against reality decays into theater.

One prices the intent, the other meters the outcome. Either alone is half a control.

## 3 · Gate, but like the safety gate — not a wall

The mechanics mirror the [policy gate](security-opa): the pipeline prices the plan and can
block on a threshold. But the posture matters more than the block — the goal is a
**transparent feedback loop**, not a new approval bottleneck. Most of the value is developers
*seeing* the number and choosing a smaller instance unprompted. Reserve hard blocks for the
outsized risks — GPU pools for AI workloads are the canonical one, where a copy-pasted
`node_count` can cost more than the rest of the platform combined.

## 4 · What I'd tell you before adopting

1. **Comment first, block later.** Run the gate in report-only mode until the estimates have
   earned trust — a false block teaches teams to route around the pipeline.
2. **Wire it into the shared component, not per-repo.** One `terraform-deploy` component means
   one place to add pricing — every consumer inherits it on the next include.
3. **Close the loop.** Publish the OpenCost actuals next to the Infracost estimates
   (the [one-pane Grafana](landscape-grafana) hub) — the gap between them is where the real
   findings live.

---
*Distilled from two good writeups: [PR cost gates with Infracost & OpenCost](https://devopsinside.com/how-to-build-pull-request-cost-gates-with-infracost-and-opencost/)
and my own wiring of the same idea into this platform's deploy component.*
