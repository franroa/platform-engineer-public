# 📡 Gathering and filtering information — an agent reads my feeds

> 💡 **TL;DR** — I don't read feeds; I read *verdicts*. An RSS reading list (a plain OPML
> file) is fetched on a schedule by an **agent** that scores every item against an
> **interest profile written as a markdown note**, throws away most of it, and writes a
> short prioritized digest into my vault — each summary linked to the source and tagged
> into the knowledge graph. The filter is versioned text, not vibes: when the digest gets
> the priorities wrong, I edit the profile note, not my habits.

## 1 · The firehose is not an information problem

Release notes, engineering blogs, CVE feeds, Kubernetes SIG updates, Terraform provider
changelogs — everything I *should* track publishes an RSS feed, and subscribing to all of
it produces exactly one outcome: an unread counter that grows until you declare bankruptcy.
The bottleneck was never access to information. It's **attention** — the same
[bottleneck](blog-claude-signals) my terminal is built around. So the fix is the same one:
don't poll, get signaled. Nothing reaches me unless something decided it was worth my time.

## 2 · The setup: a feed list, a schedule, an agent

The whole pipeline is three plain files and a timer — no database, no SaaS reader:

- **`feeds.opml`** — the reading list, versioned like code. Adding a source is a one-line
  diff; pruning one is a revert. The list *is* the subscription state.
- **`interests.md`** — the interest profile (more below). This is the filter.
- **A scheduled agent** — a cron-style job that runs an agent with one task: fetch every
  feed, deduplicate against what it has already seen (a JSON seen-list, same
  [files-as-state](blog-agent-of-empires) rule as everything else I run), and evaluate
  the new items.

The agent does what a feed reader fundamentally can't: it **reads the articles**, not just
the headlines. A title like "v1.30 release" is noise; an agent that skims the body can tell
whether the release deprecates an API the platform actually uses.

## 3 · Prioritization: the filter is a markdown note

`interests.md` says — in prose — what matters to me and how much: multi-tenant Kubernetes
patterns, Terraform provider breaking changes, supply-chain and sandbox security, agent
tooling, DevEx research; and explicitly what does *not* (framework wars, vendor launch
fluff). The agent scores each item against that note and sorts the survivors into three
buckets:

| Bucket | Meaning | What I get |
| --- | --- | --- |
| 🔴 **Act** | touches something I run — a breaking change, a CVE in the stack | 2–3 sentences + *why it affects me* + the link |
| 🟡 **Learn** | genuinely new idea in my areas | a short summary I can read in 30 seconds |
| ⚪ **Skip** | everything else | nothing — it dies silently, with a count |

Because the profile is a note in the [vault](blog-sandboxing-claude), the loop closes
naturally: when a digest mis-ranks something, I don't retrain anything — I edit two lines
of `interests.md` and the next run behaves differently. **Prompting as configuration,
versioned like configuration.**

## 4 · The digest lands in the knowledge graph

The output is one markdown note per run — `digest/2026-07-08.md` — dropped into the vault
the agents and I already share. Every summary links its source, and items worth keeping get
promoted into real notes with tags, so the digest isn't a dead end: today's 🟡 item about
OPA policy testing becomes next month's linked reference when I'm working
[in the policy repo](blog-golden-path). Reading time: a few minutes over coffee, instead of
an evening of tab triage.

## 5 · What generalizes

1. **Subscriptions are files** — an OPML list you can diff beats an account you can't.
2. **The filter must be legible** — an interest profile in prose is auditable and editable;
   a recommendation algorithm is neither.
3. **Summarize at the body, not the headline** — that's the part only an agent can do.
4. **Deliver into the system you already read** — the vault, not another inbox.
5. **Silence is a feature** — a good run mostly discards; the skip-count is how you know
   the filter worked.

## Related

[Attention is the bottleneck](blog-claude-signals) · [Skills are golden paths for agents](blog-agent-skills) ·
[Agent of Empires](blog-agent-of-empires) · [✍️ all articles](blog-index)
