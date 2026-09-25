# WAF — Web Application Firewall policies

> Repo: `up-waf`

`up-waf` centralises **Web Application Firewall** policy for the platform's ingress — specifically for **Azure Application Gateway for Containers (AGfC)**. It is deliberately *only* policy: it does **not** create gateways or routes. Those belong to the networking/application layers; security belongs here.

## What it provides

- Public WAF policies compatible with AGfC, one set per **domain / tier / region**.
- All policies run in **Prevention mode** (block, don't just log).
- They use the **Default Rule Set (DRS)** plus the **Bot Manager Rule Set**.
- They expose their **IDs** for other repos to consume, and grant the ALB Controller's managed identity permission to attach them.
- Policies are attached to an `HTTPRoute` via a Kubernetes **CRD** — the app declares "protect me", the platform supplies the policy.

## Why separate WAF from the gateway?

- **Separation of concerns.** Networking decides *where* traffic flows; WAF decides *what is allowed* to flow. Keeping them apart means a security change never risks a routing outage and vice-versa.
- **No duplicated security logic.** One standardised, reviewed policy set instead of every team hand-rolling firewall rules.
- **Consistent posture.** Every exposed route inherits Prevention-mode DRS + bot protection by default.

## Pseudocode: attach protection to a route

```
# up-waf (once, per environment)
waf = create_waf_policy(mode = "Prevention", rulesets = ["DRS", "BotManager"])
grant(alb_controller_identity, action = "attach", target = waf)
output waf.id

# an application (declarative, in its own repo)
HTTPRoute:
    annotations:
        alb.networking.azure.io/waf-policy: <waf.id>   # opt in by reference
```

The application never writes firewall rules — it references a platform-owned policy by ID, and the ALB Controller wires it up.

## ✍️ Related writing

[The OSI model, one layer at a time — and where each one runs here](blog-osi-model) ·
[Well-architected is a set of questions, not a badge](blog-well-architected)
