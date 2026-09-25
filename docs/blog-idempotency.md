# ♻️ Idempotency: declare the end state, run it twice

> 💡 **TL;DR** — an idempotent operation gives the same result whether you run it once or a
> hundred times. It's the quiet property that makes an entire platform safe to automate:
> Terraform *applies* the same config to the same result, Argo CD *syncs* a cluster toward a
> committed state on a loop, and a failed pipeline can simply be re-run. Without idempotency,
> every retry is a gamble. With it, "just run it again" is a valid recovery plan.

## 1 · Imperative breaks; declarative converges

An imperative script says *do these steps*. Run it twice and step 3 ("create the resource")
fails because the resource already exists — so now you're writing `if not exists` guards, and
your recovery story is "figure out how far it got last time." A **declarative** system says
*this is the end state*; running it again just re-checks reality against the goal and changes
only the difference. [Terraform](blog-terraform) is exactly this: `apply` against an
unchanged config is a no-op, and against a drifted one it corrects precisely the drift. The
plan *is* the diff between desired and actual.

## 2 · GitOps is idempotency on a loop

[Argo CD](landscape-argocd) takes the same idea and never stops running it. The
desired state is a Git repo; a controller continuously compares it to the live cluster and
reconciles the gap. Apply the manifest once or let the loop apply it a thousand times — the
outcome is identical, because each pass only closes the distance to the declared state. That's
why drift shows up as a *dashboard status* rather than an incident: the system is designed to
be run repeatedly, so "someone changed the cluster by hand" is just the next thing the loop
undoes.

## 3 · The property has to reach all the way down

Idempotency is only as strong as its weakest step. A pipeline that's idempotent except for one
`curl` that POSTs a non-idempotent side effect is *not* safe to retry — the one imperative
step poisons the whole run. So the discipline extends into the [Terraform
modules](terraform-modules) (every resource declared, none created by a provisioner
script) and into the [policy gate](security-opa), which evaluates the *proposed end
state* — the same input every time — rather than a sequence of mutations. Same input, same
verdict: the gate is idempotent too.

## 4 · What idempotency buys you operationally

- **Retries are free.** A transient failure — an API blip, a throttle — is recovered by
  running the job again, with no cleanup and no "did it half-apply?" archaeology.
- **Drift is self-healing.** Manual changes don't accumulate; the next reconcile erases them.
- **Disaster recovery is a re-run.** Rebuilding a region is `apply` against the same code, not
  a runbook of one-off surgeries.

## 5 · What I'd tell a team designing for it

1. **Prefer "declare the state" over "run the steps" everywhere it's an option** — Terraform
   over scripts, manifests over `kubectl` commands, config over cron.
2. **Hunt the one non-idempotent step.** It's usually a provisioner, a manual `curl`, or a
   migration that isn't guarded — and it's the step that will burn you on retry.
3. **Make "run it again" the first line of the runbook.** If that's *not* safe, you have a
   design bug, not an operational one.

## Related

[Terraform at scale](blog-terraform) · [Argo CD](landscape-argocd) ·
[Terraform modules](terraform-modules) · [The OPA policy gate](security-opa) ·
[Immutability & no SSH](blog-immutability) · [✍️ all articles](blog-index)
