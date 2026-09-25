# 🚧 Golden paths fail when they're built for the platform team

> 💡 **TL;DR** — golden paths don't fail because the idea is wrong; they fail when they're
> **designed around the platform team instead of the developers who have to live on them**.
> The failure modes are predictable — too many choices, one template for every workload,
> abandonment after launch, no escape hatches — and so are the fixes: treat
> [the path](blog-golden-path) as a product, measure whether teams are still on it six months
> later, and polish the local loop as hard as the production pipeline.

## 1 · The failure modes I take seriously

- **Built for engineers who already know the stack.** A path that assumes fluency in Helm,
  Terraform and K8s manifests isn't paved — it's a toolbox with a bow on it. The
  [three-files contract](blog-golden-path) exists precisely so a team never opens the toolbox.
- **Too many choices.** A scaffolder that asks which cloud, which deploy tool, which
  monitoring stack has recreated the decision fatigue it was meant to remove. Defaults are
  the product.
- **One template for every workload.** Backend, frontend, data and ML teams don't ship the
  same shape; forcing them through one template guarantees workarounds. Templates per
  *workload class*, one paved road *per class*.
- **Abandoned after launch.** The template that was great at the demo and untouched for a
  year teaches every team to distrust the official path — staleness spreads faster than any
  bug. (Same rot as [outdated docs](blog-golden-path): drift from reality kills trust first.)
- **No escape hatches.** GPU workloads, legacy systems and experiments will leave the path —
  the only question is whether they leave through a **reviewed exit** or a workaround. This
  platform's answer is the same as [Kyverno's](landscape-kyverno): explicit, auditable
  exceptions instead of quiet bypasses.

## 2 · The two metrics that matter

Templates-created is a vanity number. The honest ones:

1. **Retention** — is the team still on the path months later, or did they fork and drift?
2. **Bypass rate** — how often does a new service start by cloning a sibling repo instead of
   the scaffolder? Every clone is a vote that the official path is slower than the workaround.

## 3 · The fixes, compressed

Run the path as a **product**: an owner, a feedback loop, a changelog, and releases — not a
launch. Local development is part of the product (a path that only works in CI frustrates
people before it ever helps them). And when someone needs off the road, hand them a marked
exit — the goal was never compliance, it's that **developers stop thinking about the platform
and start thinking about their product**.

---
*Sparring partner for this one: [Why golden paths fail in platform engineering](https://devopsinside.com/why-golden-paths-fail-in-platform-engineering-and-how-to-fix-them/) —
its ten failure modes, tested against how this platform's paved road held up.*
