# 💥 Failure modes — what breaks, and what deliberately doesn't

> 💡 **TL;DR** — a platform's real architecture shows when something dies. This view walks three
> honest scenarios — hub services down, gateway pods killed, a whole region lost — and colors the
> same topology by status: **red = down, amber = degraded but serving, green = unaffected**. The
> argument in every scenario is the same: the blast radius is small *by design*, not by luck.

## Scenario 1 · Hub services down

Grafana, Backstage and kpack run **once**, on the eu01 hub ([why](landscape-grafana)). If they die:

- **Nothing user-facing breaks** — tenant traffic never touches the hub; the
  [gateway](landscape-traefik), routes and sidecars are per-cluster.
- **GitOps keeps reconciling** — Argo CD runs in *every* cluster; only **new image builds** queue.
- **Telemetry keeps flowing** — collectors ship to the managed backend directly; alert
  evaluation lives at the backend and keeps paging.
- Recovery is a **bootstrap run, not a restore**: everything in `platform-services/hub/` is
  declared; promoting another cluster to hub is a one-line cluster-class change.

## Scenario 2 · Gateway pods killed

The scary one, because there is deliberately [ONE gateway per cluster](landscape-traefik). The
answer is layered, and none of it is manual:

- A **PodDisruptionBudget** floors voluntary disruption — upgrades and node drains can never
  take the last replica.
- Replicas spread across zones; a killed pod reschedules while the survivors keep serving —
  **amber, not red**.
- This isn't a hope: [Litmus](landscape-litmus) runs exactly this experiment as a **reviewed,
  scheduled chaos test** (`up-gateway/chaos/`), with the PDB as the steady-state hypothesis.

## Scenario 3 · A whole region lost

The cell boundary holds: regions share **code, not fate**. Other regions serve untouched —
their gateways, tenants, GitOps loops and telemetry never routed through eu01. What eu01 takes
with it is its own tenants' capacity in that region **plus** the hub panes (scenario 1 applies
on top). The recovery story is the same bootstrap-run argument, applied twice.

## Scenario 4 · GitLab down

The quiet one, and the best test of the GitOps model: the **source of truth** is unreachable.
MRs, pipelines and *new* deploys pause — and nothing that is serving changes at all. Argo CD
reconciles the last synced commit in every cluster; traffic, telemetry and alerting never
notice. There is no in-cluster recovery to run: the queue simply drains when GitLab returns.
If losing the delivery system changed what production was *doing*, deploys and runtime were
never actually decoupled — that decoupling is what [GitOps](landscape-argocd) buys.

Even the *development* loop survives this one: pipelines here run **locally, byte-identical to
remote** ([gctui](gctui) over gitlab-ci-local), so an engineer keeps iterating through the
outage and pushes when the source of truth is back. The delivery system being down pauses
*delivery* — not production, and not the work.

## Why this page exists

"Well-architected" is a set of questions, and the most useful one is *"what happens when X
dies?"* If the answer requires a heroic on-call story, the architecture is the problem. Every
answer above is a property of the design — a PDB, a cell boundary, a run-once-by-class
placement — that a reviewer can read in code, not a promise.

And the loop closes with detection: the same map carries the **live drift feed** — including a
staged SSO-bypass route, the exact "wrong route" scenario 2 argues can't become an open door.

[**▶ Open the failure-mode lens**](#v=failure-modes) · [**◈ See the drift feed**](#drift=1)

## Related

[If the hub dies (Grafana doc)](landscape-grafana) ·
[Traefik — one shared gateway](landscape-traefik) ·
[Litmus — chaos as a reviewed experiment](landscape-litmus) ·
[Well-architected is a set of questions](blog-well-architected) · [🗺️ landscape](landscape-index)

## ✍️ Related writing

["What happens when it dies?" is the whole architecture review](blog-failure-modes) ·
[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus) ·
[Traefik — one shared gateway, many tenant routes](landscape-traefik)
