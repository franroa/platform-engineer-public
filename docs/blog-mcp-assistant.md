# 🤖 An internal DevOps assistant is mostly plumbing, and MCP is the pipe

> 💡 **TL;DR** — the useful internal AI assistant isn't a chatbot that "knows DevOps"; it's an
> LLM with **standardized, read-only taps into the systems that already know the answer**:
> git history, metrics, cluster state, runbooks. MCP is what makes that plumbing boring — one
> protocol for every tap instead of a custom connector per tool. The
> [platform's own /ask](ai-ultraplatform) is built on the same conviction: ground the model in
> real state, or don't bother.

## 1 · The architecture is four taps and a protocol

An engineer asks a question (chat, CLI); the assistant pulls context *on demand* and answers
with evidence:

- **Git/CI history** — "what changed?" is the first incident question; correlate the failure
  window with merges and deploys instead of asking around.
- **Metrics** (Prometheus/[the observability stack](landscape-opentelemetry)) — turns
  troubleshooting from vibes into numbers: latency, error rate, saturation at the moment it
  broke.
- **Cluster state** (Kubernetes API) — pod status, events, probes; the `kubectl` loop nobody
  should be typing by hand mid-incident.
- **The knowledge vault** (runbooks, postmortems, docs — retrieved semantically) — the
  [same doc-grounded retrieval](ai-ultraplatform) this map's Ask panel uses: surface the
  runbook for *this* class of failure, cite it, link it.

MCP's job is making each tap a **standard server** the assistant discovers, instead of a
bespoke integration that rots. That's the whole trick — the protocol is boring on purpose.

## 2 · The guardrails are the design

- **Read-only first.** The assistant that can restart pods on day one is an incident
  generator. Graduate write actions slowly, if ever.
- **Inherit RBAC, don't reinvent it** — the assistant sees what the asking engineer may see;
  it is not a permission escalation with a friendly tone.
- **Evidence over eloquence** — answers cite the metric, the commit, the runbook. An
  assistant that must show its sources hallucinates less and teaches more (the exact rule the
  [/ask panel](ai-ultraplatform) enforces: grounded or silent).
- **Audit every request** — the query log is both the security trail and the roadmap: the
  questions people actually ask are the docs you actually need.

## 3 · What it's actually for

Not replacing engineers — deleting the **information-gathering tax**: the twenty minutes of
tab-juggling between dashboards, git log and kubectl before anyone can even *start* reasoning.
The assistant compresses that to one question, so the human spends their time on the part that
needs a human.

---
*Distilled from [Building an internal DevOps AI assistant using MCP and LLMs](https://devopsinside.com/building-your-own-internal-devops-ai-assistant-using-mcp-and-llms/),
read against the grounding rules this platform's own [AI layer](ai-ultraplatform) already enforces.*
