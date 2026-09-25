# 🧩 Skills are golden paths for agents

> 💡 **TL;DR** — a Claude Code *skill* is a versioned, reviewable procedure the agent loads
> when a task matches: how MRs are opened here, how a CI job is developed test-driven, how a
> ticket session starts and ends. That's the same move platform engineering makes for humans
> — [the golden path](blog-golden-path) — applied to agents: **encode the paved road once,
> and the default behaviour becomes the correct behaviour.**

## 1 · Prompting is copy-paste; skills are the library

Without skills, every session re-explains the house rules: branch naming, commit format,
which labels an AI-authored MR must carry, what the description template looks like. That's
copy-paste engineering with a chat window — the exact failure the platform's
[three libraries](blog-reuse-libraries) exist to kill. A skill moves those conventions into a
**file in a repo**: written once, versioned, diffable in review, and loaded automatically
when the trigger matches. When the convention changes, the skill changes — every future
session complies without being told.

## 2 · Two skills that carry my workflow

- **The MR skill.** Creating a merge request is never "run `git push` and improvise." The
  skill owns branch naming, Conventional Commits, the required AI-authorship labels, and the
  team's description template. The agent doesn't remember the rules; it *executes* them.
  The interesting effect is social: reviewers see uniform MRs regardless of which agent (or
  human mood) produced them.
- **The pipeline-TDD skill.** CI work follows a loop: run the job locally, fix, repeat until
  green, then run the whole local pipeline, then open the MR
  ([run the pipeline before you push it](blog-local-remote-ci)). Encoding the *loop* matters
  more than encoding facts — it makes the agent's behaviour test-driven by default, and the
  exit-code interfaces of the local runner are what make the loop drivable at all.

## 3 · Where skills sit: Workflow × AI

I tag these posts both *Skills* and *Workflow*, and the intersection is the point. A skill is
not an AI artifact that happens to touch your workflow — it **is** workflow, expressed in the
one place an agent reliably reads. The test for what belongs in a skill is the golden-path
test: *would I put this in a pipeline component or a module if the consumer were human?* If
yes — naming rules, safety gates, ceremonies — it goes in a skill. If it's judgment
(what to build, whether a diff is right), it stays with the human and the review.

## 4 · What I'd tell a team writing their first skills

1. Start with the ceremony you correct most often in review — that's your highest-value skill.
2. Encode loops and gates, not just facts; "keep running the job until green, then MR" beats
   a page of context.
3. Keep skills in version control next to the conventions they encode; a skill nobody can
   diff is folklore again.
4. Give skills the same review bar as CI components — agents will follow them *exactly*,
   including the mistakes.

## Related

[The golden path is three files](blog-golden-path) ·
[Three libraries, one platform](blog-reuse-libraries) ·
[Run the pipeline before you push it](blog-local-remote-ci) ·
[A cockpit for a fleet of agents](blog-agent-cockpit) · [✍️ all articles](blog-index)
