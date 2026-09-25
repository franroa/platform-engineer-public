# 🔐 TLS is easy; rotating certificates without downtime is the real job

> 💡 **TL;DR** — getting a certificate is a solved problem. The part that bites teams is the
> *lifecycle*: certificates expire, and an expiry you forgot is an outage with a countdown you
> set yourself months ago. This platform treats certificates as continuously-renewed state, not
> one-time artifacts — issued and rotated by a controller, and the rotation actually reaches the
> workloads that hold them. The goal isn't "we have TLS"; it's "no human is on the hook for a
> renewal date."

## 1 · The expiry you scheduled and forgot

Every certificate is a time bomb with a friendly name. Issue one by hand, note the renewal in a
calendar, and you've created an outage scheduled for a date nobody will remember. The only
durable fix is to remove the human from the renewal loop entirely:
[cert-manager](res-cert-manager) requests, validates and **renews** certificates on a
schedule well before expiry, so "the cert expired" stops being a category of incident. The
certificate becomes managed state that converges, exactly like everything else the platform
[declares and reconciles](blog-idempotency).

## 2 · A renewed cert nothing picks up is still an outage

Here's the trap teams fall into after automating issuance: the controller renews the certificate
in a secret, but the running pods loaded the *old* one at startup and never look again. The
renewal succeeded and the outage happens anyway. That's why rotation has to reach the workload:
[Reloader](landscape-reloader) watches the secret and triggers a rolling restart of
the pods that mount it, so a rotated certificate is actually *served*, not just stored. Issuance
and propagation are two halves of one job — automate only the first and you've moved the outage,
not removed it.

## 3 · Terminate TLS where you can see the request

Where you terminate matters. This platform terminates at the [ingress / WAF](res-ingress-waf)
edge — the [L7 boundary](blog-osi-model) — so the request can be inspected, rate-limited
and policy-checked in the clear before it reaches the workload, while everything outside stays
encrypted. Terminating at the edge isn't a shortcut; it's putting decryption where the security
controls that need to read the request already live.

## 4 · What I'd tell a team hardening TLS

1. **Never issue a certificate a human has to remember to renew.** If a renewal date lives in
   someone's head or a calendar, it's already a future incident.
2. **Prove the new cert is being served, not just stored.** Rotation that doesn't restart the
   consumer is a silent no-op.
3. **Terminate where your controls are.** Decrypt at the edge that can inspect and enforce, and
   keep every other hop encrypted.

## Related

[cert-manager](res-cert-manager) · [Reloader — rotation that reaches pods](landscape-reloader) ·
[Ingress & WAF](res-ingress-waf) · [Idempotency & desired state](blog-idempotency) ·
[The OSI model](blog-osi-model) · [✍️ all articles](blog-index)
