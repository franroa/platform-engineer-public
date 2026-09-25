# 🧩 A skill is a prompt you only write once

> 💡 **TL;DR** — a skill is the paved road for an agent: the difference between re-explaining your
> conventions every session and encoding them once. Write it for the version of you that's tired at
> 2am — one job, the tools it may touch, the guardrails it must not cross, and a worked example — and
> make the *description* do the work of getting it triggered at the right moment.

## 1 · The prompt you keep retyping

You notice you need a skill the third time you type the same paragraph into a fresh session: "when you
open an MR, use conventional commits, add the AI labels, follow our description template, never push to
a base branch." That paragraph *is* the skill. A skill is just the prompt you were going to write
anyway, captured so you never write it again — and so it can improve as a **diff in a repo** instead
of drifting between sessions ([skills are golden paths for agents](blog-agent-skills) makes the case
for why that versioning matters).

The bar for extracting one is low and empirical: if you've explained the same procedure to an agent
twice, the third time should be an invocation, not an explanation.

## 2 · One skill, one job

The most common mistake is the grab-bag skill that "handles deployments" — bootstrap, deploy, roll
back, monitor, all in one. It's hard to trigger (when does it apply?), hard to review, and hard to
trust. Split by concern instead: a skill that *creates an MR*, a skill that *watches the pipeline*, a
skill that *runs the deploy locally*. Small skills compose; big skills collide.

A good heuristic: a skill should have one **verb**. If describing it needs an "and," it's probably
two skills. This is the same discipline as a good function — [do one thing](blog-twelve-factor), name
it precisely, and let the caller sequence.

## 3 · The description is the API

An agent doesn't read your skill's body to decide whether to use it — it reads the **description**.
So the description is not documentation, it's the trigger contract: it has to name the situations,
verbs and artifacts that should fire the skill ("use when creating an MR / merge request / pull
request; handles branch naming, conventional commits, labels"). A vague description ("helps with git")
is a skill that never runs at the right moment, or runs at the wrong one.

Write the description for *recall*, not for *summary*. List the synonyms a user might actually say.
The most beautifully written skill body is worthless if the description doesn't make the agent reach
for it — and a review should check exactly that ([review a skill by the mistakes it prevents](blog-reviewing-skills)).

## 4 · Encode the whole ceremony

A skill that only *starts* a task leaves the discipline to memory again — which is the thing you were
trying to eliminate. Encode the whole arc: **start → do → gate → finish.** A ticket-work skill that's
worth having sets up the session, tracks decisions *as they surface*, enforces a security review gate
before closing, and runs the finish ceremony (retrospective, ticket comment, MR). The agent can't
forget the boring parts because the boring parts *are* the skill.

The parts people skip are always the ends: the setup that makes the work reproducible, and the
closing gate that catches the mistake. Those are exactly the parts worth encoding, because they're the
parts a human under time pressure drops first.

## 5 · Guardrails belong inside the skill

If a skill can do something dangerous, the prohibition goes *in the skill*, phrased as an absolute:
"never push to a base branch — create a feature branch and open an MR." Don't rely on the agent
inferring caution from context; state the veto where the action lives. The separation mirrors CI:
some rules **deny** (guardrails, gates) and some rules **do** (the workflow) — keep them distinct and
let the deny-rules bite unconditionally.

Guardrails are also what make a skill safe to run *unattended*. A skill you have to babysit isn't
saving you much; a skill whose dangerous edges are fenced can be trusted to run to completion.

## 6 · What good looks like

The skills that earn their place share a shape:

1. **One job, one verb** — splittable concerns are split.
2. **A description written for recall** — it names the situations and synonyms that should trigger it.
3. **The whole ceremony** — start, do, gate, finish; not just the exciting middle.
4. **A worked example** — the exact commands or format, so the agent matches a pattern instead of
   improvising one.
5. **Absolute guardrails** — the vetoes stated plainly, where the action is.

Get those right and a skill stops being a note-to-self and becomes infrastructure: a habit your agent
has, versioned and reviewable, that runs the same way whether you're sharp or exhausted. Organising a
whole collection of them is its own move — [a marketplace for your agent's habits](blog-synapse-skills).

## Related

[Review a skill by the mistakes it prevents](blog-reviewing-skills) ·
[Skills are golden paths for agents](blog-agent-skills) ·
[A marketplace for my agent's habits](blog-synapse-skills) ·
[A good plan names the files before it touches them](blog-writing-plans) · [✍️ all articles](blog-index)
