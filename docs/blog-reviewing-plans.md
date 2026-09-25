# 🔍 The cheapest bug to kill is still in the plan

> 💡 **TL;DR** — reviewing a plan is higher-leverage than reviewing the diff, because a wrong
> assumption caught in the plan costs a sentence and the same assumption caught in the pull request
> costs a rewrite. Review the *approach, the blast radius, the missing states and the escape hatch* —
> not the prose. And when you approve, approve narrowly.

## 1 · Where bugs are cheapest

Every bug has a price that rises with time. In the plan it costs a comment. In the diff it costs a
re-review. In production it costs an incident. So the plan review is the single most efficient review
you will ever do — you are killing bugs at their cheapest, before any code has been written to defend
them.

Yet plan reviews are the ones people rush ("looks reasonable, go"). That's backwards. The diff will
get scrutinised by definition; the plan is the one gate where a five-minute read can save a day, and
it's the one people wave through.

## 2 · Read the plan against the goal, not itself

The first failure mode isn't a bad plan — it's a good plan for the **wrong problem**. So don't start
by checking the plan for internal consistency. Start by holding it next to the original request and
asking: *does executing this, exactly as written, give the user what they actually asked for?*

This is where you catch the plan that builds a likes feature the user explicitly declined, or solves
the general case when they wanted the specific one. A plan can be flawless and still be aimed at the
wrong target. Aim first, mechanism second.

## 3 · The four questions

Once the aim is right, a plan review is really four questions:

- **Approach** — is this the simplest thing that works, or is it clever? Clever plans have more
  places to be wrong. Prefer the boring path unless the boring path is genuinely inadequate.
- **Blast radius** — what does this touch that it didn't have to? A plan that edits six files to add
  one behaviour deserves a "why six?" A plan that reaches into a shared generator or a base config
  deserves extra scrutiny — those edits radiate.
- **Missing states** — the happy path is always covered; the review's job is the rest. What happens
  on 404, on empty, on a second run, on the mobile viewport, on the user who already clicked
  "decline"? [Idempotency](blog-idempotency) and the failure branches are where plans are thin.
- **Escape hatch** — if this is wrong in production, how do we undo it? A plan with no rollback story
  is a plan that's very confident. Ask for the "won't" list, too — an unbounded plan will grow during
  execution.

## 4 · Reject vague verification

If a plan says "test thoroughly" or "make sure nothing breaks," it hasn't been planned — it's been
hoped. Verification is the part of a plan most likely to be hand-waved and most costly when it is,
because it's the step everyone is tired by the time they reach.

Push for checks a machine could run: an exact command, a specific number that must stay green, a
concrete observation ("the banner does not reappear on reload"). "Thorough" is not a test; a failing
build is. This is the same discipline that belongs in [writing the plan](blog-writing-plans) in the
first place — as a reviewer you're just refusing to let it be skipped.

## 5 · Say yes narrowly

The output of a plan review isn't a thumbs-up, it's a **scoped** yes: "approved for these files, this
approach, this verification — and if you discover you need to touch the base config, come back." A
broad approval is read by an eager executor (human or agent) as licence to improvise, and improvisation
is where the side-quests and the scope creep live.

Narrow approval keeps the plan honest through execution: the moment reality diverges from what was
approved, that's a signal to re-check, not a blank cheque to keep going. The cheapest bug is the one
still in the plan — a good review is what keeps it there until it's dead.

## Related

[A good plan names the files before it touches them](blog-writing-plans) ·
[Review a skill by the mistakes it prevents](blog-reviewing-skills) ·
[Run the pipeline before you push it](blog-local-remote-ci) ·
[Idempotency is the property that lets you retry](blog-idempotency) · [✍️ all articles](blog-index)
