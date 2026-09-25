# 🗺️ A good plan names the files before it touches them

> 💡 **TL;DR** — a plan is the cheapest place in the whole workflow to be wrong. Write it so a
> reviewer can kill the mistake before a single line of code exists: name the exact files and the
> exact edits, put the verification *in the plan*, and spend most of your words on what you are
> deliberately **not** going to do.

## 1 · A plan is a diff you can argue with before it exists

The reason to write a plan — for yourself or for an agent — is not documentation. It's that a plan
is a **draft of the change at the only moment editing is free**. Once code exists, every correction
costs a rewrite, a re-review, a re-run of the tests. In the plan, a wrong assumption costs one
sentence.

So the test of a plan isn't "does it sound reasonable." It's: *can someone who disagrees with the
approach see the disagreement here, instead of in the pull request?* If the plan is a paragraph of
good intentions, the answer is no — the real decisions are still hidden, and they'll surface as
surprises during execution.

## 2 · Name the files, not the intentions

The single highest-signal thing a plan can contain is a list of the files it will touch and what
each edit does. Compare:

```
Bad:  "Add analytics with a consent banner across the site."
Good: "New analytics.js (self-contained GA loader + banner).
       index/writing/ultraplatform/cv/terminal.html: <script> in <head> after canonical.
       make-post-pages.mjs: add ../analytics.js to the template.
       publish.mjs: add analytics.js to ARTIFACTS."
```

The second version is reviewable. A reader immediately sees the blast radius (six files plus a
generator), spots the omission if there is one ("what about the generated `p/*.html` pages?"), and
can veto the approach *before* it's built. The first version can only be evaluated after the work is
done — which defeats the purpose of planning.

Naming files also forces you to actually locate them. Half of all bad plans are bad because the
author hadn't yet opened the code and was planning against an imagined structure.

## 3 · Put the verification in the plan

A plan that ends at "implement the thing" is only half a plan. The other half is: **how will we
know it worked?** Write the checks down as concrete commands or observations, not adjectives:

- not "make sure it's tested" → "smoke suite stays 179/0; headless probe confirms Accept loads
  gtag and Decline doesn't."
- not "verify nothing leaks" → "`publish.mjs --dry` leak gate clean with the new file in the
  artifact set."

Verification written in advance is a commitment you can't quietly walk back when you're tired at the
end. It's also the part a reviewer should push on hardest — see
[the cheapest bug to kill is still in the plan](blog-reviewing-plans).

## 4 · Scope is mostly the "won't"

Most plans fail not by doing the wrong thing but by doing three extra things nobody asked for. A
good plan is aggressive about stating its own boundaries: *this change does X; it does not touch Y;
Z is a separate task.* When a user says "add analytics, and also likes," the plan that writes down
**"likes: explicitly out of scope, per the decision to skip it"** is worth more than the one that
silently builds both.

The "won't" list is also where you record the decisions you already made so you don't relitigate
them mid-execution. Convert every "we could also…" into either a line item or an explicit non-goal.
Ambiguity left in the plan becomes improvisation during the work, and improvisation is where scope
creep and half-finished side-quests live.

## 5 · The shape that survives execution

A plan that holds up under an agent — or a distracted human — taking it literally has a recognisable
shape:

1. **Context** — the one paragraph of *why*, so a reader can catch a plan that solves the wrong
   problem.
2. **Files touched** — the table of edits, specific enough to diff against.
3. **The tricky bit** — the one design decision that isn't obvious, argued explicitly (the
   place a reviewer's attention is worth the most).
4. **Verification** — the commands and observations that will prove it.
5. **Out of scope** — the "won't," including decisions already settled.

Everything else is narration. If your plan is mostly narration and light on files, checks and
non-goals, you've written a summary of your hopes, not a plan. The good version is boring, specific,
and — crucially — **wrong in ways you can see now**, which is the whole point. Encoding a plan you
run over and over? That's when it graduates into [a skill you only write once](blog-writing-skills).

## Related

[The cheapest bug to kill is still in the plan](blog-reviewing-plans) ·
[A skill is a prompt you only write once](blog-writing-skills) ·
[Skills are golden paths for agents](blog-agent-skills) ·
[Run the pipeline before you push it](blog-local-remote-ci) · [✍️ all articles](blog-index)
