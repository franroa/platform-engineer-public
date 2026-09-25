# 🤖 An AI layer for a developer platform

> 💡 **TL;DR** — an assistant that answers "where do I change X?" is only useful if it's
> **grounded in the platform's own state and docs**. This map runs that idea end-to-end: a live
> GitLab sync, a markdown knowledge graph, and a chat that cites repos and notes instead of
> guessing.

## The problem with "just add a chatbot"

Platform questions are precise: *which repo grants tenant permissions? which subnets exist in
eu01? how do we deploy — pipelines or GitOps?* A bare LLM answers confidently and wrong. The
fix isn't a bigger model — it's **feeding it the platform**:

1. **Live state.** A small engine syncs the GitLab group on an interval: repos → architecture
   views, detected features, environments → subscriptions, a terraform **security inventory**
   (every role assignment, subnet, firewall rule, peering, private endpoint in the code) and
   per-repo **deploy variables**. The [AI view](ai-ultraplatform) shows where this layer sits.
2. **A knowledge graph, not a wiki.** Every resource here has a Notion-style note
   (TL;DR → concept → usage → lifecycle → gotchas) and the notes **link to each other** — a
   real graph, managed with [IWE](https://iwe.md). Agents don't grep 40 files; they pull one
   consolidated bundle: the note plus everything it links.
3. **Grounded answers with sources.** The chat layers its answers: curated platform facts →
   the live inventory ("firewall rules? *these files*") → the concept notes' TL;DRs → an LLM
   pass **with all of the above as context** when a key is present. Every answer carries the
   repo/note it came from.

## Design rules that made it work

- **The docs are the RAG corpus *and* the UI.** The same markdown renders in this panel,
  grounds the chat, and feeds agents — one source of truth, three consumers. Writing the TL;DR
  well *is* prompt engineering.
- **Structure beats embeddings at this scale.** A linked graph + a title/TL;DR index answers
  platform questions more reliably than a vector store — and it's inspectable.
- **Agents follow the same rules as humans.** The reconciliation agent that maps new repos into
  views runs with a schema-validated plan and an explicit exclude list; drift is surfaced in
  the UI (⚠ badge) before anything is auto-merged.
- **Anonymization as a build step.** The public version of everything you're reading was
  produced by scripts that translate every internal name and *fail closed* if one survives —
  the same discipline as any other release artifact.

## Where this goes next

Comparing code against the deployed cloud (drift as a first-class signal), pipeline health on
the map, and letting the assistant *execute* the runbooks it cites — with the same gates the
humans use.

## Related

[AI view](ai-ultraplatform) · [Ask panel / chat](overview) · [Security & OPA](security-opa) ·
[✍️ all articles](blog-index)
