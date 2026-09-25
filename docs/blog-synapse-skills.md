# 🗂️ fran-local-synapse — a marketplace for my agent's habits

> 💡 **TL;DR** — my Claude skills don't live loose in a dotfiles folder; they're organised as
> **plugins in a local marketplace** (`fran-local-synapse`): a *workflow* plugin
> (working-on-ticket, dev-loop, grill-me), a *platform* plugin (setup-gitlab-pipeline,
> watch-ci, test-terraform-locally), a *git* plugin (guardrails, pre-commit) and a
> *productivity* plugin (daily updates, hour logging). Same registry idea as any package
> ecosystem — versioned, grouped, reviewable — applied to agent behaviour.

## 1 · A marketplace, but local-first

Claude Code installs plugins from marketplaces; a marketplace is just a repo with a manifest.
So my personal skills live in their own local one, alongside the team's shared marketplace —
the two compose. The split mirrors software dependencies: *shared conventions* come from the
team registry, *my workflow* comes from mine, and both arrive versioned instead of
copy-pasted into a config directory. When a skill improves, it improves as a **diff in a
repo**, not as an untracked edit ([skills are golden paths for agents](blog-agent-skills)
covers why that matters).

## 2 · The workflow plugin: ceremonies as code

- **working-on-ticket** — the session ceremony: set up the work session for a ticket, track
  decisions and problems *as they surface* (not reconstructed at the end), enforce a security
  review gate before closing, then run the finish ceremony — retrospective, ticket comment,
  MR. The agent can't "forget" the boring parts because the boring parts are the skill.
- **dev-loop / grill-me** — the inner loop and its adversary: iterate on a change, then have
  the agent interrogate the work (assumptions, edge cases, missed requirements) before a
  human reviewer spends time on it.

## 3 · The platform plugin: paved roads for infra work

- **setup-gitlab-pipeline** — bootstrap CI for a new project *the platform way*: the shared
  component architecture (base, env-trigger, terraform-deploy), runner tags, cloud auth,
  state isolation, and the prerequisite checklist. What used to be an afternoon of copying a
  neighbour repo's config is a skill invocation — and it can't copy the neighbour's mistakes.
- **watch-ci** — after an MR opens, watch the real pipeline, diagnose failures from job logs,
  propose the fix, wait for approval, loop until green — the remote half of
  [run the pipeline before you push it](blog-local-remote-ci).
- **test-terraform-locally** — stand up a throwaway consumer harness to plan/apply an
  unpublished module against real cloud before it ships to the registry.

The *git* plugin guards the edges (hooks that block destructive git commands, pre-commit
formatting/typechecking), and *productivity* automates the daily update and hour logging —
small skills, but they run every day, which is where automation compounds.

## 4 · What I'd tell someone organising their skills

1. Group skills into plugins by concern (workflow / platform / git), not into one grab-bag —
   discoverability is half the value.
2. Run a local marketplace next to the team one; personal habits and shared conventions
   deserve different release cadences.
3. Encode ceremonies end-to-end (start → track → gate → finish); a skill that only starts
   things leaves the discipline to memory again.
4. Let the guardrail skills veto (blocked commands, gates) and the workflow skills propose —
   same separation as CI: policies deny, pipelines do.

## Related

[Skills are golden paths for agents](blog-agent-skills) ·
[Run the pipeline before you push it](blog-local-remote-ci) ·
[The golden path is three files](blog-golden-path) · [✍️ all articles](blog-index)
