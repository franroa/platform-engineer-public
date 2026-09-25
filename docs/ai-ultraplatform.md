# AI · Ultraplatform — the intelligence layer

> Repos: `ultraplatform-ai`, `up-agents`, `ai/`, `terraform-provider-ultraplatform`

**Ultraplatform** is the internal name for the platform, and its AI layer sits at the very top of the delivery spine — it *uses* everything below it (identity, network, clusters, tenancy) rather than being depended upon by them.

## What's in it

- **`ultraplatform-ai`** — a tool-agnostic **artifact library**: skills, agents, commands and hooks the platform team uses when working with AI assistants (Claude Code, Copilot, Cursor, GPT-, Gemini-based tools). Distributed as a plugin so `/ultraplatform:*` skills are available in every session.
  - **Skills** — reusable, step-by-step guidance for a task.
  - **Agents** — narrow, minimal-toolset sub-agents.
  - **Commands** — orchestrate skills into end-to-end workflows.
  - **Hooks** — lifecycle automation.
- **`up-agents`** — agentic automation that operates *on* the platform.
- **`terraform-provider-ultraplatform`** — a custom Terraform provider exposing platform primitives as first-class resources.
- **[`fran-local-synapse` — the skills marketplace](marketplace)** — the delivery mechanism
  for all of the above on a workstation: a **local plugin marketplace** where every skill,
  agent, command and hook lives versioned, packaged into installable plugins (git,
  productivity, workflow, platform tooling, portfolio). One source of truth, symlinked where
  the artifacts are authored, installed where they're used.

## The philosophy

> A sovereign, high-performance foundation that abstracts the complexity of the cloud, so engineers build, deploy and scale with precision.

The AI layer is deliberately **tool-agnostic**: artifacts describe *what* good work looks like (concepts, steps, guardrails) so they outlive any single assistant. Claude Code-specific glue (CLAUDE.md, hooks) is layered on top and loaded automatically, but the knowledge underneath is portable.

## Why it's the top block

- It **consumes** the platform's guarantees — identity, isolation, the OPA gate — rather than providing them. An agent still deploys through the same secretless, policy-gated pipeline as a human.
- It encodes **team knowledge as artifacts**, turning "how we do X" into something an assistant can execute consistently.
- It keeps humans in control: agents propose and execute *within* the same envelopes (PIM, network, policy) that bound everyone else.

## Governed model access — the `ai/` tier

Neither laptops nor applications ever hold raw model keys. The `ai/` repos are three tiers
with a one-way dependency chain — `ai-foundry` (the shared model workspace + GPT-5.x
deployments) → `ai-gateway` (the **connector**: an API Management GenAI gateway) →
`ai-subscriptions` (one YAML entry per consuming application; merge auto-applies and the
key is shared via the secrets manager).

The gateway is the governed door **from developer laptops to the AI Foundry**, and it
serves two kinds of traffic: **agentic development** — Claude Code pointed at the gateway
(`ANTHROPIC_BASE_URL` + a personal key; the gateway speaks the Anthropic Messages API
unchanged and reaches Claude in a Sweden Central Foundry account via managed identity) —
and **applications** — an OpenAI-compatible facade where clients keep the OpenAI SDK and
change only `base_url`. Both are budgeted (`llm-token-limit`, 50k TPM sandbox / 100k TPM
live), metered per user × model, and revocable per key. The gateway runs as a **live
platform service in eu01** — the map draws it as a flow: laptop → APIM gateway → AI
Foundry, on the globe and in the region's live block next to the platform API.
Full story: [A raw model key is a budget with no owner and no off switch](blog-ai-gateway).

## Pseudocode: an agent acting on the platform

```
skill  = load("/ultraplatform:deploy-module")
plan   = agent.run(skill, inputs)          # proposes a change
review = human_or_policy_gate(plan)        # PIM + OPA still apply
if review.allowed:
    pipeline.trigger(plan)                 # same secretless, gated deploy path
```

## ✍️ Related writing

[A raw model key is a budget with no owner and no off switch](blog-ai-gateway) ·
[An AI layer for a developer platform](blog-ai-platform) ·
[Blender now takes a chat message as input, and that changes who can 3D-model](blog-blender-mcp) ·
[A marketplace of one — versioning your own AI skills](blog-marketplace) ·
[An internal DevOps assistant is mostly plumbing, and MCP is the pipe](blog-mcp-assistant) ·
[Dapr — building-block APIs a sidecar gives every language](landscape-dapr)
