# 🧱 Defense in depth — no single wall, because walls fall

> 💡 **TL;DR** — security that depends on one control failing zero times is a countdown to a
> breach. Defense in depth assumes every layer *will* eventually be bypassed and makes sure the
> next one still stands. This platform stacks independent controls — identity, network, policy —
> so getting through one buys an attacker almost nothing. The measure of the design isn't how
> strong the outer wall is; it's how little a breach of it is worth.

## 1 · One perfect wall is a single point of failure

Every control has a bad day: a misconfigured rule, an unpatched CVE, a leaked credential. If your
security is one strong perimeter, that bad day is a full breach. Defense in depth refuses the
premise that any single layer holds forever. Instead it asks a harder question of the whole
system: *when — not if — this control is bypassed, what does the attacker actually get?* If the
answer is "the next locked door," the design is working.

## 2 · Three independent envelopes, not one moat

This platform wraps workloads in three controls that don't share a failure mode.
[Identity with PIM](identity-pim) means no standing power — even a stolen session isn't a
standing admin, because privilege is activated, time-boxed and audited. The
[hub-and-spoke network](network-hub-spoke) means every path crosses an inspected hub, so
lateral movement isn't free. The [OPA policy gate](security-opa) means a dangerous change
is *rejected at apply*, before it ever runs. Punch through one and the other two are still
in the way — and none of them depends on the others being intact.

## 3 · Blast radius is the real metric

Because breaches are assumed, the design optimizes for *containment*, not just prevention. A
[tenant is a cell](blog-tenant-isolation): near-admin inside, no power outside, so a
compromised tenant is a contained incident, not an org-wide one. Secrets live
[where the tenant can't destroy them](blog-tenant-keyvaults); traffic is inspected at the
[L7 edge](blog-load-balancing). Each boundary shrinks what a successful attack reaches. "How
strong is the wall?" is the wrong question; "how far does one breach spread?" is the one that
predicts how bad your worst day gets.

## 4 · What I'd tell a team building layered defense

1. **Assume each control fails and design the next.** If bypassing one layer ends the game, you
   have one layer wearing a costume, not depth.
2. **Keep the layers independent.** Controls that share a credential, a network path or a config
   source fail together — that's one control, not three.
3. **Optimize for blast radius.** Prevention buys you time; containment decides how bad the
   breach you didn't prevent turns out to be.

## Related

[Identity & PIM](identity-pim) · [Hub-and-spoke network](network-hub-spoke) ·
[The OPA policy gate](security-opa) · [A 403 is the fence doing its job](blog-tenant-isolation) ·
[Tenant Key Vaults](blog-tenant-keyvaults) · [Immutability & no SSH](blog-immutability) ·
[✍️ all articles](blog-index)
