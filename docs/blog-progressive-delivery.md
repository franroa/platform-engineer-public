# 🚦 Blue-green and canary — ship to a few before you ship to everyone

> 💡 **TL;DR** — a deploy is a bet that the new version works. Big-bang releases put the whole
> stake on one roll; progressive delivery keeps most of it back. **Blue-green** runs the new
> version alongside the old and flips traffic all at once (with an instant flip back).
> **Canary** sends a slice of traffic to the new version, watches the signals, and widens only if
> they hold. Both need the same two things this platform already has: routing that splits traffic
> and telemetry that tells you whether to continue.

## 1 · The release is the risky part, so shrink it

Most incidents happen at deploy time — new code meeting real traffic for the first time. You
can't remove that risk, but you can shrink the blast radius of being wrong. Blue-green does it in
*time*: the new version is fully up and validated before a single user is switched, and rollback
is a traffic flip back to the still-running old version, not a frantic redeploy. Canary does it
in *population*: 5% of users meet the new version first, so a bad release hurts 5%, not everyone,
and only for as long as it takes the metrics to say "stop."

## 2 · It's just traffic-splitting plus a health signal

Neither pattern needs exotic machinery — both are [HTTPRoute](res-httproute) weight
changes driven by a decision. [Argo CD](landscape-argocd) rolls out the new version as a
declared state; the route sends 5% (canary) or 0%→100% (blue-green) to it; and the *only*
question is whether to proceed. That question is answered by the [SLIs and error
budget](blog-slo-error-budgets): if the canary's success rate and latency stay inside the
SLO, widen; if they degrade, the same declarative machinery rolls the weight back. Progressive
delivery is traffic-splitting wearing a feedback loop.

## 3 · Rollback is the feature, not the fallback

The reason these patterns work is that the old version is still *there* — blue-green keeps it
running, canary never fully drained it. That makes rollback a
[replacement, not a repair](blog-replace-dont-repair): you don't debug the bad version in
place, you shift traffic back to the known-good one and delete the bad rollout. A deploy strategy
whose rollback is "hotfix forward under pressure" isn't progressive delivery — it's a big-bang
with extra steps.

## 4 · What I'd tell a team rolling this out

1. **Decide the promotion signal before the deploy.** "Widen the canary if success rate holds
   above the SLO for 10 minutes" — an automatable rule, not a nervous human judgment call.
2. **Keep the old version warm until you're sure.** Instant rollback only exists if the thing
   you're rolling back to is still running.
3. **Automate the rollback, not just the rollout.** If widening is automatic but reverting is
   manual, you've automated the confident half and left the scary half to panic.

## Related

[HTTPRoute](res-httproute) · [Argo CD](landscape-argocd) ·
[SLOs & error budgets](blog-slo-error-budgets) · [Replace, don't repair](blog-replace-dont-repair) ·
[Multi-tenant Kubernetes](blog-kubernetes) · [✍️ all articles](blog-index)
