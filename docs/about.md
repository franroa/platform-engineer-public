# Francisco Roa — Platform Engineer

> This site is my **PKM + portfolio**: an interactive 3D map of a real internal developer platform I build and operate. Names are anonymized to a Lord-of-the-Rings theme, but the architecture, patterns and trade-offs are the real thing.

I design and run **internal developer platforms** end-to-end — the paved road that lets product teams ship safely and fast, without re-implementing infrastructure, pipelines or security every time.

## What I do

- **Platform as a product** — reusable **Terraform modules**, **GitLab CI components** and **Helm charts**; tenancy, golden paths, and a clear **shared-responsibility** model (Cloud · Platform · App).
- **Cloud & networking** — Azure, **hub-and-spoke** VNets, cross-subscription peering, DNS, a single **P2S VPN** entry point.
- **Kubernetes** — AKS (cluster / node pools / platform services), ingress + WAF (AGfC), cert-manager, GitOps.
- **Infrastructure as Code** — Terraform at scale, remote-state as a single source of truth, module libraries.
- **CI/CD & policy** — GitLab CI components, **OPA/rego** safety gates (plan → policy → apply), secretless OIDC.
- **Security & identity** — Entra ID, **PIM**, least-privilege RBAC, **Key Vault isolation** (per tenant-region, separate RG).
- **Observability** — Grafana / Mimir / Loki, dashboards & alerting as code.

## Tools I've built

- **gctui** — a local GitLab-CI cockpit (Go + Bubble Tea): assemble, run pipelines locally, diff vs remote.
- **tflocal** — local-only Terraform overrides (Go): run real modules locally, then leave the tree untouched.
- **time-tracker (`tt`)** — ticket-aware time tracking in tmux (Python).

## How to explore this map

- **Overview** — nested governance envelopes around the delivery spine. Toggle **⧉ Nested / ▤ Stacked**.
- **Click any block** → its 3D internals + a concept doc (Notion-importable).
- **Build an App (guided)** — descend Region → Cluster → Tenant → App with **Next**, one scope at a time.
- **Reuse · Resources & Scopes · Shared Responsibility** — how everything composes and who owns what.

## Links

- **GitHub** — [github.com/franroa](https://github.com/franroa)
- **This site's source** — [github.com/franroa/platform-engineer](https://github.com/franroa/platform-engineer)
- **Contact** — [franciscoroaprieto@gmail.com](mailto:franciscoroaprieto@gmail.com)

*Built with Three.js. Every diagram is data-driven and each concept doc is written to be reused as knowledge — hence PKM + portfolio.*
