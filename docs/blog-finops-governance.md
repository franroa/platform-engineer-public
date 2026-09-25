# 🧾 Cost governance is three verbs: estimate, meter, standardize

> 💡 **TL;DR** — cloud cost governance keeps getting sold as a dashboard. It's actually a
> **cycle with three verbs**: *estimate* before deploy (Infracost on the plan), *meter* at
> runtime ([OpenCost](landscape-opencost) on the cluster), and *standardize* the metric so
> every team and cloud reports cost in the same shape. Tools are interchangeable; the cycle
> isn't.

## 1 · The cycle

- **Estimate (pre-deploy).** Infracost prices infrastructure changes at plan time — the
  [MR cost gate](blog-finops-cost-gates). Governance that starts after provisioning is a
  post-mortem.
- **Meter (runtime).** OpenCost allocates the real bill to namespace/workload/tenant from
  actual usage against actual pricing. This is what turns "the cluster is expensive" into
  "*this* tenant's *this* deployment is expensive."
- **Standardize (reporting).** The OpenCost metric shape is an open standard — which is the
  quiet superpower: allocation queries look the same across clusters and clouds, so the
  [one-pane Grafana hub](landscape-grafana) can put cost next to latency without a custom
  exporter per provider. (Kubecost is the commercial layer on the same engine — richer UI,
  same underlying model; this platform runs the open standard.)

## 2 · Governance practices that actually stick

1. **Alerts over reviews** — threshold breaches page a channel the way a
   [PolicyReport violation](landscape-policy-reporter) does; monthly cost meetings review the
   *trend*, not individual line items.
2. **Cost in the MR, always** — the estimate is part of the diff, like tests and the
   [safety gate](security-opa). Nobody is surprised by a bill they approved in review.
3. **Shared-cost rules written down** — control plane, system pods and idle headroom get an
   explicit, documented split; undocumented allocation is a permanent argument generator.
4. **FinOps as a shared practice, not a team** — finance sets the thresholds, the platform
   wires the tooling, developers own their namespaces' numbers.

## 3 · The honest caveats

- **Tags/labels are the weakest link** — allocation is only as accurate as workload labeling;
  a mislabeled namespace silently bills the wrong team. (Same lesson as
  [OpenCost's requests caveat](landscape-opencost): garbage in, confident-looking garbage out.)
- **Multi-cloud fragments visibility** — different billing models and APIs mean the standard
  metric layer is what saves you, not any single vendor pane.
- **Coverage gaps are real** — VMs and serverless outside Kubernetes need their own path;
  don't pretend the cluster view is the whole bill.
- **It's not free to run** — the integration and its upkeep are a platform feature with an
  owner, or it rots like any abandoned [golden path](blog-golden-paths-fail).

---
*Distilled from [Cloud cost governance using Kubecost, OpenCost and Infracost](https://www.opensourceforu.com/2026/01/cloud-cost-governance-using-kubecost-opencost-and-infracost/),
reshaped around how this platform actually wires the three verbs.*
