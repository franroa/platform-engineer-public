# 🏗️➡️☁️ From on-premises to cloud — migrate the operating model, not the servers

> 💡 **TL;DR** — lift-and-shift moves machines; a platform migration moves the *operating
> model*. The sequence that worked: land the guardrails first (identity, network, policy),
> move workloads through the [golden path](blog-golden-path) rather than around it, and
> treat the old environment as a read-only reference that gets **starved, not switched
> off**. The cloud you end with should look like it was born there.

## 1 · Guardrails before workloads

The first things that existed in the cloud were not applications: the
[hub-and-spoke network](network-hub-spoke), [identity with PIM](blog-access-as-code) and
the [policy gate](blog-terraform) came first — because every workload that lands AFTER the
guardrails inherits them, and every workload that lands before becomes an exception you'll
carry for years. It's slower for the first app and faster for the next fifty.

## 2 · The path is the migration

Each service moved by being *onboarded*, not copied: a tenant config, a pipeline from the
[CI components](blog-reuse-libraries), charts from the library. Yes — that means the
migration doubled as a refactor; that's the point. The alternative (recreate the snowflake
faithfully, "fix it later") ships the old operating model with new IP ranges.

- **Data first, stateless last**: databases moved early with managed replacements and long
  dual-run windows; stateless services followed in dependency order.
- **The strangler pattern at the edge**: DNS/ingress moved per-route, so rollback was a
  record change ([External DNS](landscape-external-dns) made this declarative).

## 3 · Starve the old world

The on-prem estate never had a shutdown party. Retention shrank, access narrowed to
read-only, monitors moved, and the last hosts died quietly months after anyone had logged
in. Migrations fail at the tail — the starvation model makes the tail boring.

## Related

[Moving between Azure subscriptions](blog-migration-subscriptions) ·
[Migrating observability](blog-grafana-cloud-migration) · [✍️ all articles](blog-index)
