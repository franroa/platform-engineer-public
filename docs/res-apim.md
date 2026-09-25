# 🧩 API Management (APIM)

> 💡 **TL;DR** — APIM is the **connector**: a managed front door that sits between consumers
> and a backend and owns the *relationship* — who may call, how much, and what gets measured.
> Here it runs the platform's **GenAI gateway**: the governed path from developer laptops to
> the models in Azure AI Foundry.

| Property | Value |
| --- | --- |
| **Scope** | regional PaaS — live instance in eu01 (VNet-integrated) |
| **Created by** | `ai/ai-gateway` |
| **IaC type** | `azurerm_api_management` (+ APIs, products, policies, subscriptions) |

## 🧠 The concept
An API gateway is policy as infrastructure. The backend stays dumb and honest; the gateway
enforces everything relational: **authentication** (per-user/per-app subscription keys),
**budgets** (`llm-token-limit` — token-per-minute caps that return `429 + Retry-After`),
**metering** (`llm-emit-token-metric` → App Insights, sliced by user × model) and **routing**
(`set-backend-service` — which model plane answers).

The consumer never holds a credential to the backend itself. Revoking a person is deleting
one APIM subscription — the model deployment never notices.

## 🏗️ How it's used in this platform
As the **AI gateway** (`ai/ai-gateway`), the front door for AI/agentic development:

- **Developer laptops (agentic coding)** — Claude Code pointed at the gateway
  (`ANTHROPIC_BASE_URL` + a personal key): the gateway speaks the Anthropic Messages API
  unchanged and forwards to Claude hosted in [Azure AI Foundry](res-ai-foundry.md) using
  its **managed identity** — no model key exists on any laptop.
- **Applications** — an OpenAI-compatible facade (`/llm/v1`) in front of the shared GPT
  model workspace; per-app keys provisioned as YAML in `ai/ai-subscriptions`.

Two tiers: sandbox (Basic v2, no VNet, auto-deployed) and live (Standard v2, VNet-integrated
into the private APIM subnet, manual gate).

## ⚙️ Lifecycle & change
Trunk-based in `ai/ai-gateway`: MR runs plan, merge auto-deploys sandbox, live is a manual
gate. Policies are XML files in the repo — a budget change is a reviewable diff, not a
portal click.

## 🔗 Related concepts
The gateway is one piece of the platform's AI ecosystem — the full story (Foundry → gateway
→ subscriptions, and why laptops never hold model keys) is in
[AI · the intelligence layer](ai-ultraplatform.md). Neighbours:
[Azure AI Foundry](res-ai-foundry.md) — the model plane behind it ·
[Developer laptop](res-laptop.md) — the consumer end of the flow ·
[Hub-and-spoke network](network-hub-spoke.md) — the topology it plugs into (live tier is
VNet-integrated into a hub subnet).
