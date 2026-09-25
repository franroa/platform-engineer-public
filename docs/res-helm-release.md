# ⛵ Helm Release

> 💡 **TL;DR** — a Helm release is an **installed instance of a chart with concrete values**.
> Apps here don't write manifests: they depend on platform charts (`up-helm-charts`) via
> `Chart.yaml` and supply a thin `values.yaml`. Deploy logic is *reused*, not copied.

| Property | Value |
| --- | --- |
| **Scope** | app (per namespace, per stage) |
| **Created by** | app pipelines using `up-ci-components` deploy jobs |
| **Chart source** | `up-helm-charts` (versioned library charts) |

## 🧠 The concept
Helm is the package manager pattern for K8s: **chart** (templates) + **values** (config) →
**release** (installed, versioned instance). The leverage move is *library charts*: one
well-tested chart encodes how this platform deploys (probes, security context, HTTPRoute,
quotas), and every app is `dependencies: [platform-chart]` + values. Fix the chart once,
every app inherits it on next upgrade.

## 🏗️ How it's used in this platform
- Apps declare the platform chart as a **pinned dependency** in `Chart.yaml`; their own
  `values.yaml` stays business-only (image, env, hostname, resources).
- Releases are rolled out by the CI deploy components — same plan/apply discipline as infra.
- The release history (`helm history`) is the app's deployment ledger per namespace.

## ✅ Best practices we apply
- **Pin chart versions** — an app upgrade and a chart upgrade are separate, reviewable events.
- Values files per stage (`values-prod.yaml`…) — no templating of environments in CI strings.
- `helm diff` in MR pipelines — reviewers see the *rendered* change, not the abstraction.

## ⚠️ Gotchas
- A failed upgrade can leave `pending-upgrade` state that blocks the next one — rollback,
  don't force.
- CRDs install but don't upgrade via Helm by design — CRD bumps need their own step.
- `--reuse-values` accumulates surprises; prefer explicit, complete values per release.

## 🔗 Related
[Namespace](res-namespace.md) · [HTTPRoute](res-httproute.md) ·
[helm-charts view](up-helm-charts.md) · [gitlab-components](gitlab-components.md)

---
**Repo (map alias):** `up-helm-charts` · deploy jobs: `up-ci-components`.

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes)
