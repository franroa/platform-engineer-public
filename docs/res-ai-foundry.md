# 🧠 Azure AI Foundry

> 💡 **TL;DR** — AI Foundry is where the **models actually live**: managed model deployments
> (Claude, GPT) inside the platform's own subscription. Nobody calls it directly — all
> traffic arrives through the [AI gateway (APIM)](res-apim.md), which authenticates with a
> managed identity.

| Property | Value |
| --- | --- |
| **Scope** | shared platform resource — one account serves every environment |
| **Created by** | `ai/ai-foundry` (shared GPT workspace) · `ai/ai-gateway` (Claude backend) |
| **IaC type** | `azurerm_cognitive_account` + model deployments |

## 🧠 The concept
Hosting models in your own cloud subscription (instead of calling a vendor SaaS directly)
buys three things: **data residency** (prompts and completions stay in your tenancy and
region), **identity-based access** (the gateway reaches the model with a managed identity —
no API key exists to leak), and **model choice as code** (deployments are Terraform: adding
a model is an MR, and the deployment *name* is what clients pass in the `model` field).

## 🏗️ How it's used in this platform
- **Shared GPT workspace** (`ai/ai-foundry`) — one Foundry account hosts the GPT-5.x
  deployments behind the gateway's OpenAI-compatible facade. No sandbox/live split: the
  same models serve every environment; the *gateway* tier is what differs.
- **Claude backend** (declared in `ai/ai-gateway`) — Claude for agentic development runs in
  a separate Foundry account in **Sweden Central**, because Claude on Foundry is only
  offered in two regions and Sweden Central keeps the traffic in the EU.

The region split is deliberate: the gateway lives with the platform (eu01), each model
lives wherever its vendor offering allows — the gateway absorbs the distance.

## 🗺️ Which icon did you click?
The globe draws **two** Foundry icons because there are **two separate Foundry accounts**
(the doc-panel title names the one you clicked):

| Icon on the map | Resource behind it |
| --- | --- |
| **Claude Sonnet · Sweden Central** — placed at its real coordinates, at the end of the laptop → gateway line | the **gateway-owned** Foundry account (declared in `ai/ai-gateway`), Sweden Central, hosting Claude for agentic development |
| **GPT-5.x · planned** — tucked under the eu01 region next to the gateway, grey + dashed | the **shared model workspace** (`ai/ai-foundry`), eu01/West Europe, hosting the GPT-5.x deployments behind the `/llm/v1` facade — still an unmerged scaffold |

One doc covers both because the *concept* (models in our tenancy, identity-based access,
models as code) is identical; only the owner and region differ.

## ⚙️ Lifecycle & change
Models are a map in tfvars — MR to add one, manual gate to apply (model changes are
impactful, and Azure serialises Cognitive Services operations: applies run with
`-parallelism=1`). The gateway picks up new deployments on its next apply.

## 🔗 Related concepts
Foundry is the model plane of the platform's AI ecosystem — consumers never reach it
directly; every call comes through the [API Management gateway](res-apim.md) from a
[developer laptop](res-laptop.md) or an application. The full picture (three `ai/` tiers,
one-way dependency chain) is in [AI · the intelligence layer](ai-ultraplatform.md).
