# 🚚📊 Migrating observability: from on-premises to Grafana Cloud

> 💡 **TL;DR** — we moved a self-hosted Grafana/Prometheus/Loki stack to
> [Grafana Cloud](blog-grafana-cloud) without a big-bang: **dual-write at the agents,
> migrate the readers, then starve the old stack**. Dashboards and alerts moved as code
> (they already lived in git); the hard parts were cardinality hygiene, retention
> expectations and the auth model — none of which are technical surprises, all of which
> are decisions.

## 1 · The order that works

1. **Inventory by consumer, not by component** — who reads which dashboard/alert; delete
   the dead ones first (we dropped ~40% before moving anything).
2. **Dual-write from the edge**: Alloy agents got a second remote-write/log sink. On-prem
   stayed authoritative; the cloud filled with identical data for weeks.
3. **Move the READERS**: repoint dashboards-as-code and alert rules at the new datasources
   — a provider switch in terraform, reviewable and revertible.
4. **Cut alert routing over** in one change window, with the old Alertmanager silenced but
   alive (the rollback is one revert).
5. **Starve and decommission**: shrink on-prem retention until it's a cache, then delete.

## 2 · What actually bit

- **Cardinality tax became visible.** On-prem hid label abuse in disk; per-series billing
  surfaces it. Fixing the top offenders BEFORE cutover kept the first bill boring.
- **Retention is a contract now.** "We keep everything since 2019" quietly became "13
  months of metrics"; the archives that mattered moved to object storage exports.
- **Auth flipped models**: from network-trusted on-prem access to SSO + service accounts —
  which is an upgrade ([nobody holds standing power](blog-access-as-code)), but every
  scripted consumer needed a token it didn't have before.

## 3 · What I'd tell you

Dual-write is cheap insurance — the agents don't care, and it converts a migration into a
comparison exercise. And migrate *dashboards you can regenerate*: if they don't live in
git yet, that's step zero, not a nice-to-have.

## Related

[Observability on the platform](observability) ·
[Grafana in the landscape](landscape-grafana) ·
[Grafana Cloud as the backend](blog-grafana-cloud) · [From on-premises to cloud](blog-migration-onprem-cloud) ·
[✍️ all articles](blog-index)
