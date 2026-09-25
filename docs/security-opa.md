# Security & Governance — the inner envelope (OPA / rego)

> Repos: `development/up-ci-toolkit`, `development/up-ci-components`, `up-policies`, `up-security-policies`, `up-guardrails`

The innermost shell wraps the **delivery path itself**. Before any `terraform apply` lands, its plan is evaluated by an **Open Policy Agent (OPA) / rego** safety gate. Infrastructure doesn't change unless policy says it may.

## The safety gate

The shared `terraform-deploy` CI component runs **plan → OPA evaluation → apply** as one job. A `safety_level` input picks how strict the gate is:

| Level | Blocks… |
|---|---|
| `paranoid` | **any** resource being destroyed |
| `high` *(default)* | destroying data **and** infrastructure (networks, VMs, K8s) |
| `standard` | destroying **data** resources only (databases, storage, secrets) |
| `none` | nothing — ephemeral/sandbox only |
| `custom` | a user-supplied policy file |

## Why rego, and why composable

Policies are **modular and layered by provider**, so protection is defined once and reused:

```
policies/terraform/
├── common.rego        # shared helpers (destroyed / replaced resource sets)
├── paranoid.rego      # block ALL destroys
├── high.rego          # imports azurerm.high  (+ aws.high, gcp.high, …)
├── standard.rego      # imports azurerm.standard
└── azurerm/
    ├── standard.rego  # data: databases, storage, secrets
    └── high.rego      # standard + infra: networks, VMs, AKS
```

Adding a cloud (say AWS) means writing `aws/standard.rego` + `aws/high.rego` and importing them — every consumer inherits the new protection with no change on their side.

## Pseudocode: the decision

```rego
# a plan is allowed only if nothing protected is destroyed or replaced
default allow := false

critical_destroyed := { r | r := destroyed_resources[_]; protected[r.type] }
critical_replaced  := { r | r := replaced_resources[_];  protected[r.type] }

allow if {
    count(critical_destroyed) == 0
    count(critical_replaced)  == 0
}

violation[msg] {
    r := critical_destroyed[_]
    msg := sprintf("BLOCKED: %s (%s) would be DESTROYED", [r.address, r.type])
}
```

## The other governance layers

- **`up-policies`** — Azure Policy definitions/assignments (e.g. force the AKS Azure Policy add-on, deploy diagnostic settings). Compliance logic centralised as a product, not copied per service.
- **`up-waf`** — Web Application Firewall policies (see the WAF doc).
- **`up-security-policies`** — GitLab-native security policies (e.g. enforce a DAST scan in every pipeline on protected branches).
- **`up-guardrails`** — the umbrella for these preventive controls.

## Why an envelope, not a checklist

Because the gate is **in the deploy job**, safety is not a habit someone might forget — it is a wall the change physically cannot pass. "high" is the default, so the safe choice is the one you get for free.

**📓 Runbook:** [cloud-vs-code drift triage](runbook-drift-response.md)

## ✍️ Related writing

[Nobody holds standing power](blog-access-as-code) ·
[An AI layer for a developer platform](blog-ai-platform) ·
[Defense in depth — no single wall, because walls fall](blog-defense-in-depth) ·
[The cheapest cost review happens before the merge](blog-finops-cost-gates) ·
[Cost governance is three verbs: estimate, meter, standardize](blog-finops-governance) ·
[The golden path is three files, not a wiki page](blog-golden-path) ·
[Idempotency: declare the end state, run it twice](blog-idempotency) ·
[You can't SSH into production — that's the feature](blog-immutability) ·
[Three libraries, one platform](blog-reuse-libraries) ·
[A 403 is usually the fence doing its job](blog-tenant-isolation) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform) ·
[Well-architected is a set of questions, not a badge](blog-well-architected) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[Litmus — chaos as a reviewed experiment, never a surprise](landscape-litmus) ·
[OpenCost — cost allocation, per tenant, per namespace](landscape-opencost)
