# 💥 "What happens when it dies?" is the whole architecture review

> 💡 **TL;DR** — every architecture diagram is a happy-path drawing. The real design shows when
> you delete something from it and read what's left. Ask that question three times — of the hub,
> of the shared gateway, of a whole region — and either the answer is a *property of the design*
> (a PDB, a cell boundary, a run-once placement) or it's a heroic on-call story. Heroics are a
> finding, not an answer.

## 1 · The question reviewers under-ask

Well-architected reviews love checklists: encryption at rest, tagged resources, an owner per
subscription. All fine, none of it is the architecture. The architecture is the answer to a
blunter question, asked of every box on the diagram: **what happens when this dies — and who
notices?**

The question is cheap to ask and brutally clarifying, because it forces the diagram to admit
its dependencies. If the answer takes more than two sentences, you've found coupling nobody
drew. If the answer is "that can't happen," you've found the next incident.

I keep [a lens in the platform map](failure-modes) that answers it visually — same topology,
three scenarios, and the node color *is* the status: red down, amber degraded-but-serving,
green unaffected. What follows is the reasoning behind each answer.

## 2 · Kill the hub: panes are not the platform

Grafana, Backstage and kpack run **once**, on the hub cluster — a deliberate
[run-once placement](landscape-grafana). Delete them and read what's left:

- Tenant traffic doesn't route through the hub. Green.
- GitOps runs **in every cluster** — Argo CD keeps reconciling everywhere. Green.
- Collectors ship telemetry directly to the backend, where alert evaluation lives. Green.
- Dashboards, the portal, and **new image builds**: red — and nobody outside engineering notices.

The design statement hiding in that answer: **a pane of glass must never be load-bearing.** The
moment dashboards sit in the traffic path, or builds gate a restart, the hub stops being a
convenience and becomes a dependency you now have to run in N regions. Keeping it
red-but-harmless is what lets it be cheap.

## 3 · Kill the gateway pods: the scary one, on purpose

There is exactly [ONE service gateway per cluster](landscape-traefik) — a shared-fate zone by
construction, and the design's most attackable choice. So that answer can't be prose; it has
to be machinery:

```yaml
# up-gateway/gateway/pdb.yaml — the floor
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: traefik
```

A PodDisruptionBudget means upgrades, node drains and consolidation *cannot* take the last
replica. And because a resilience claim without a test is folklore,
[Litmus](landscape-litmus) kills gateway pods **on a schedule** — every 20 seconds for two
minutes — while a *continuous* HTTP probe asserts the status page keeps answering *through*
the gateway. The PDB is the hypothesis; the probe is the proof; a failed probe is a design
bug filed against the gateway repo, found on a Tuesday afternoon instead of during an incident.

That's what turns "gateway pods die" from red into amber: **degraded but serving** is a state
you can engineer for, and then rehearse until you believe it.

## 4 · Kill a region: cells share code, not fate

The regional answer is the cheapest of the three, because it was bought early: regions are
cells. Each runs its own gateway, its own GitOps loop, its own collectors — they share the
*declarations* (one repo describes them all) and nothing at runtime. Lose one and the others
never route a packet differently.

What the lost region takes with it is honest: its own tenants' capacity there, plus — if it
was the hub — scenario 2's panes on top. The recovery is the same both times: everything the
region ran is declared, so recovery is a **bootstrap run, not a restore**. Promoting another
cluster to hub is a one-line cluster-class change and a sync.

## 5 · Make the answers inspectable

The reason to encode this in [a clickable lens](failure-modes) rather than a wiki page is the
same reason policies live in code: answers rot, properties don't. The lens draws from the same
node definitions the rest of the map uses; the PDB and the chaos experiment live in the same
repo as the gateway they defend; the [drift feed](failure-modes) even stages the SSO-bypass
route to show detection closing the loop.

So run the review this way: pick a box, delete it, write down what's left. If the answer is a
design property, draw it. If it's a war story — that's the backlog, and
[well-architected](blog-well-architected) was never about the badge anyway.
