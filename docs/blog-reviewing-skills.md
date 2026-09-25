# 🧪 Review a skill by the mistakes it prevents

> 💡 **TL;DR** — you don't lint a skill, you taste-test it. A good skill review asks whether the
> *description* makes it trigger at the right moment, whether the *steps* survive an agent that takes
> them literally, and whether the *guardrails* actually stop the failure you're afraid of. Judge it by
> the mistakes it prevents, not by how it reads.

## 1 · A skill review is a taste test, not a lint

A skill isn't code you can run through a linter; it's a prompt that will be *interpreted* by an agent
under conditions you can't fully predict. So reviewing one is less like checking syntax and more like
tasting a dish: does it do what it promises, in the situations it claims, without a bad aftertaste? The
question is never "is this well written" — it's "**what does this prevent, and does it actually
prevent it?**"

That reframing changes what you look at. Prose quality is almost irrelevant. Trigger accuracy, literal
robustness, and guardrail bite are everything.

## 2 · Does it trigger?

The first thing to review is the part authors treat as an afterthought: the **description**. An agent
decides whether to use a skill from its description, not its body, so a skill with a beautiful body and
a vague description is a skill that never fires — or fires at the wrong time. Read the description and
ask: *given a realistic user request, would the agent reach for this?* And the inverse: *would it grab
this when it shouldn't?*

Test it against the synonyms a user might actually say. If the skill is for creating merge requests,
does the description also catch "PR," "open a review," "ship this branch"? A trigger that only matches
the author's exact phrasing is a trigger that fails for everyone else. This is the contract half of
[writing a skill](blog-writing-skills), and it's the half most worth a reviewer's attention.

## 3 · Read it as a literal agent would

Humans fill gaps with common sense; agents fill them with improvisation. So read every instruction
literally and hunt for the place where "obviously you'd…" isn't written down. "Create a branch" —
named how? "Add the labels" — which labels, exactly? "Run the tests" — which command, and what counts
as pass?

The failure you're looking for is the **under-specified step that an eager executor will guess at**.
Every guess is a place the skill quietly diverges from what you meant. Where you find one, the fix is
usually a worked example — the exact command or format — so the agent matches a pattern instead of
inventing one.

## 4 · The guardrails have to bite

If the skill can do something destructive, find the prohibition and pressure-test it. Is it stated as
an absolute ("never push to a base branch"), or is it a soft suggestion the agent can rationalise past
under pressure? A guardrail that says "prefer a feature branch" is not a guardrail; it's a preference.

Then ask the darker question: *what's the worst thing this skill could do if every ambiguous
instruction were resolved in the least careful way?* If the answer includes an irreversible action
with no gate in front of it, the review isn't done — the skill needs a veto or a confirmation exactly
there. Guardrails are the whole reason a skill can be trusted to run unattended, which is the same
standard you'd apply when [reviewing a plan](blog-reviewing-plans): where's the escape hatch?

## 5 · Fewer instructions, sharper ones

The last pass is subtraction. Long skills aren't safer — they're *harder to follow*, and an agent that
loses the thread halfway through a wall of caveats will drop the caveats that matter. Every instruction
that isn't load-bearing dilutes the ones that are. Cut the throat-clearing, merge the redundant steps,
and promote the two or three rules that actually prevent the failure to the top where they can't be
missed.

A skill you can approve is one where you can point at each instruction and name the mistake it stops.
If you can't name the mistake, the instruction is probably noise — and noise is what buries the signal
that keeps the skill safe. Judge it by what it prevents, ship it lean, and it'll hold up the same way
whether the agent reading it is fresh or six tool-calls deep.

## Related

[A skill is a prompt you only write once](blog-writing-skills) ·
[The cheapest bug to kill is still in the plan](blog-reviewing-plans) ·
[Skills are golden paths for agents](blog-agent-skills) ·
[A marketplace for my agent's habits](blog-synapse-skills) · [✍️ all articles](blog-index)
