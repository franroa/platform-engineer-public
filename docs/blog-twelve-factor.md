# 1️⃣2️⃣ Twelve-Factor isn't a checklist — it's what the platform makes free

> 💡 **TL;DR** — the Twelve-Factor App reads like a list of rules a developer must remember.
> On a real platform it inverts: the *platform* enforces most of the twelve so the app team
> gets them for free. Config comes from the environment because the only place secrets live is
> a vault. Processes are stateless because the filesystem is ephemeral. Logs are streams
> because nothing writes a logfile. Twelve-Factor stops being discipline and becomes the
> default shape of the paved road.

## 1 · The factors nobody has to think about

Four of the twelve are simply *true* here, whether or not a team has read the manifesto:

- **Config in the environment (III).** There is no `config.prod.json` to leak — values arrive
  as env vars, and secrets are pulled from a [per-tenant Key Vault](res-key-vault)
  at deploy time. Config lives outside the build, always.
- **Stateless processes (VI).** Pods run on [AKS](kubernetes) with an ephemeral
  filesystem; anything durable goes to a database or object store. "It works because of a file
  on that one box" can't happen — there is no that-one-box.
- **Logs as event streams (XI).** Applications write to stdout; the platform ships the stream
  to [Grafana/Loki](observability). No app rotates a logfile, because no app owns one.
- **Disposability (IX).** A pod can die at any second and be rescheduled — fast startup and
  clean shutdown aren't nice-to-haves, they're survival traits in a scheduler that will
  absolutely evict you.

## 2 · The factors the golden path enforces

Others are guaranteed by *how* you ship, not by good intentions. **Dependencies (II)** are
explicit because the [Helm and Terraform libraries](reuse) are versioned references,
not copied snippets. **Build/release/run separation (V)** is the pipeline itself: a build
produces an image, a release binds it to config, a run schedules it — three stages, never
collapsed. **Dev/prod parity (X)** is the whole point of running the *same* pipeline locally
that runs remotely. You don't achieve these factors by being careful; you achieve them by
taking [the golden path](blog-golden-path), where they're the only route.

## 3 · Where Twelve-Factor shows its age

Two factors need a 2020s translation. **Backing services (IV)** as "attached resources" is
right, but here the attachment is a Terraform module and a secret written to the tenant vault,
not a URL in an env file. And **port binding (VII)** — the app exposing itself via a port — is
mediated by a Service and an [HTTPRoute](res-httproute): the app binds a port, but
what the world reaches is a routed, TLS-terminated, policy-checked address. The factor holds;
the mechanism moved up a layer.

## 4 · What I'd tell a team adopting it

1. **Don't hand developers the twelve as homework.** Bake the enforceable ones into the
   platform so the wrong thing is the hard thing.
2. **Treat a violated factor as a platform gap, not a developer failure.** If someone needed a
   local logfile, the log pipeline was missing — fix the pipeline.
3. **Statelessness is the load-bearing one.** Get processes disposable and the rest —
   scaling, replacement, zero-downtime deploys — become reachable instead of aspirational.

## Related

[Multi-tenant Kubernetes](kubernetes) · [Tenant Key Vaults](res-key-vault) ·
[Observability](observability) · [The golden path](blog-golden-path) ·
[Reuse & golden paths](reuse) · [Replace, don't repair](blog-replace-dont-repair) ·
[✍️ all articles](blog-index)
