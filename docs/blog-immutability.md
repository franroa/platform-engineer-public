# 🔒 You can't SSH into production — that's the feature

> 💡 **TL;DR** — the fastest way to make a system unreproducible is to give someone a shell on
> it. Every manual `apt install`, every hot-fixed config file, every "I'll just restart it by
> hand" is drift the code doesn't know about — and a box you can no longer rebuild from source.
> Immutable infrastructure removes the temptation by removing the door: there's no SSH into
> production because there's nothing to log in and *fix*. You change the code and roll a new
> one.

## 1 · The mutable server is a one-way ratchet

A server you log into and tweak accumulates state nobody wrote down. Six months later it's a
"snowflake" — unique, precious, and terrifying to touch, because no one knows which of its
hand-applied changes are load-bearing. The failure isn't the first SSH; it's the hundredth,
after which the running system and the code that supposedly describes it have quietly diverged.
Rebuild it from scratch and it doesn't come back the same. That's the whole disaster in one
sentence: **a box you can't recreate from code is a box you can't recover.**

## 2 · Immutability closes the door on purpose

Here the artifact is an image, and the [cluster](kubernetes) runs it read-only. You
don't patch a running container — you build a new image, roll it out, and let the old one die.
The infrastructure underneath is the same story: it exists because [Terraform
declared it](blog-terraform), and the only supported way to change it is to change the
declaration and re-apply. There's no interactive access path that bypasses the code, because
that path is exactly the one that creates snowflakes. Locking it isn't bureaucracy — it's what
keeps "the code is the truth" honest.

## 3 · If the code is the only way in, the code stays true

When there's no side door, [Argo CD](landscape-argocd) can meaningfully claim the
cluster matches Git — nobody can quietly contradict it from a shell. The
[policy gate](security-opa) can vet every change, because every change is a reviewed
declaration, not a live keystroke. And access itself follows the same logic:
[PIM-activated, audited identity](identity-pim) for the rare break-glass case, never a
standing root login. Immutability is what makes all the *other* guarantees enforceable rather
than aspirational.

## 4 · "But how do I debug it?"

The honest objection. You don't debug by mutating the patient — you observe it. Logs, metrics
and traces stream out ([observability by default](observability)); you reproduce
in a sandbox that's built from the same code; and when you've found the fix, it lands as a
commit, not a command. If the *only* way to understand a problem is to SSH in and poke, that's
a signal your instrumentation is too thin — fix the observability gap, not the box.

## 5 · What I'd tell a team going immutable

1. **Make the shell the exception, gated and audited** — break-glass with PIM, never a daily
   habit.
2. **Every fix is a commit.** If a change didn't go through code, it didn't happen — and it'll
   vanish on the next roll.
3. **Invest the SSH budget in observability.** The reason people reach for a shell is missing
   signal; give them the signal and the shell stops being tempting.

## Related

[Multi-tenant Kubernetes](kubernetes) · [Terraform at scale](blog-terraform) ·
[Argo CD](landscape-argocd) · [The OPA policy gate](security-opa) ·
[Identity & PIM](identity-pim) · [Replace, don't repair](blog-replace-dont-repair) ·
[✍️ all articles](blog-index)
