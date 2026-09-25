# 🐄 Replace, don't repair — cattle, not pets

> 💡 **TL;DR** — the moment something breaks, you have two instincts: fix it in place, or throw
> it away and roll a fresh one from code. On a platform, the second wins almost every time.
> Repairing a live instance is a bespoke, unrepeatable act that leaves you with a slightly
> different system than you started with. Replacing it is boring, automatic, and identical
> every time. "Pets" get names and nursing; "cattle" get a number and a replacement. Everything
> here is cattle by design.

## 1 · Repair is a special case; replacement is the general one

Fixing in place feels faster — until you count the cost. A repair is a one-off procedure
performed under pressure, usually undocumented, that nudges the instance away from the state
its code describes. Do it a few times and you're back to a [snowflake you can't
rebuild](blog-immutability). Replacement inverts the economics: the fix isn't applied to
the broken thing, it's applied to the *template*, and a new instance is rolled from it. The
broken one is deleted, not debugged. You trade a clever manual save for a dumb repeatable one —
and dumb-repeatable is what scales.

## 2 · The platform replaces things for you already

This isn't a philosophy you enforce by hand — the machinery does it. When a node goes
unhealthy, [Karpenter](landscape-karpenter) drains and replaces it, and the
[node pools](res-node-pools) are shaped so the workloads reschedule onto fresh
capacity. When a pod dies, the scheduler makes a new one; nobody nurses it back. When cluster
state drifts, [Argo CD](landscape-argocd) doesn't repair the difference by hand — it
re-applies the declared state, which for a broken object means *replace it with the correct
one*. Replacement is the default verb at every layer.

## 3 · This only works because rebuilds are cheap and identical

"Replace, don't repair" is a fantasy if a rebuild is slow, risky, or non-deterministic — you'd
never dare. It's viable here because [Terraform](blog-terraform) makes standing up a
fresh instance a re-run of the same code, so the replacement is *identical* to what it replaced,
not a hand-assembled approximation. The two ideas are a pair:
[immutability](blog-immutability) makes rebuilds deterministic, and deterministic
rebuilds make replacement safe enough to be the reflex. Take away either half and you slide back
to nursing pets.

## 4 · Where repair still has a place

Honesty: some things *are* pets, and pretending otherwise is its own failure. A stateful
primary database isn't cattle — you don't casually replace the source of truth. The move there
is to shrink the pet: put the durable state in as few, well-backed places as possible, and make
*everything around it* cattle. The goal isn't zero pets; it's a herd with a couple of carefully
tended animals, not a barn full of them.

## 5 · What I'd tell a team adopting the reflex

1. **When something breaks, ask "can I roll a new one?" before "how do I fix this one?"** —
   make replacement the first thought, not the last resort.
2. **Count your pets.** Every named, hand-tended instance is a recovery risk; drive the number
   toward the few that genuinely hold state.
3. **Invest in fast, deterministic rebuilds.** The reflex is only as brave as your confidence
   that the replacement comes back exactly the same.

## Related

[Immutability & no SSH](blog-immutability) · [Karpenter](landscape-karpenter) ·
[Node pools](res-node-pools) · [Argo CD](landscape-argocd) ·
[Terraform at scale](blog-terraform) · [Twelve-Factor](blog-twelve-factor) ·
[✍️ all articles](blog-index)
