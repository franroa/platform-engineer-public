# 🔁 Run the pipeline before you push it

> 💡 **TL;DR** — CI round-trips are the slowest debugger in the industry. My rule:
> **local runs must mirror the remote steps, and every divergence must be auditable.**
> gctui — a terminal cockpit over `gitlab-ci-local` — runs the *same* pipeline on my machine,
> keeps jobs **byte-identical** to what GitLab would run, shows a **diff of local vs remote**
> config (including which variables exist where), and then watches the real remote pipeline
> after push. Green locally, pushed once, green remotely.

## 1 · The check is the same check, twice

The workflow has two gates and they must agree:

- **Local**: run the job under development in a loop until it passes, then the whole pipeline
  (`plan → OPA → apply` and friends), on the laptop, in containers — exit codes and all, so
  agents and scripts can drive it too. My agent workflow is literally test-driven CI:
  the agent edits the job, runs it locally, repeats until green, *then* opens the MR.
- **Remote**: after push, a poller watches the actual GitLab pipeline and reports into the
  tmux statusline ([signals](blog-claude-signals)). Remote is the source of truth; local is
  the fast approximation of it.

The point is not "test locally" — everyone says that. The point is the two runs execute the
**same job definitions**, so a local green actually predicts a remote green.

## 2 · Byte-identical or it doesn't count

The failure mode of every local-CI tool is drift: a wrapper injects a variable here, skips a
step there, and six months later local-green means nothing. Two defences:

- **Marker-free wrappers.** The local runner overrides only the shared base of the pipeline
  (the one include every repo consumes) — the job scripts themselves stay byte-identical to
  what the remote executes. No sentinel comments, no patched YAML in the repo.
- **The `D` key.** One keystroke diffs the *effective* local configuration against the
  remote's — including the **names** of deploy variables present on each side. Divergence is
  allowed (some things can't run on a laptop) but it is **visible and deliberate**, never
  silent ([local mirrors remote](dev-workflow) is the principle; the diff is its enforcement).

## 3 · The awkward parts, handled honestly

Real pipelines resist laptops in specific ways, and each gets an explicit answer rather than
a shrug: deploy jobs get a **local/remote toggle** (default local, so a rehearsal can't touch
real infra); runtime deploy variables are injected from a config file that holds **no
secrets** (secret-shaped values come from the host environment or not at all); and jobs whose
scripts assume the CI image's toolchain get a **bridge that discovers those tools from the
image itself** — cached per image digest — instead of hardcoding paths that rot. Every one of
these is a divergence from remote, which is why every one shows up in the diff.

## 4 · What I'd tell a team adopting this

1. Make local vs remote parity a *checked* property (a diff you can open), not a promise.
2. Give jobs exit-code interfaces — if a human must read the output to know it failed,
   agents can't drive the loop.
3. Default rehearsals to not touching real infrastructure; opting into danger should be typed.
4. Watch the remote pipeline from the same place you ran the local one — one queue, one
   attention channel.

## Related

[Attention is the bottleneck](blog-claude-signals) · [gctui](gctui) ·
[Skills are golden paths for agents](blog-agent-skills) ·
[GitLab components](gitlab-components) · [✍️ all articles](blog-index)
