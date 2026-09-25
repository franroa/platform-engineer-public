# ✉️ Every alert email can prove where it came from

> 💡 **TL;DR** — platform tools (Grafana, Airflow, …) don't each configure their own SMTP;
> they share **one internal email relay** (Azure Communication Services, provisioned by
> `up-communications`) with **one sender identity per tool**. And every message it sends
> carries a **check that proves its origin**: a DKIM signature, verifiable by any receiver
> against keys the platform itself publishes in DNS. An alert email from this platform isn't
> just *from* `grafana@notifications.<public-domain>` — it can *prove* it.

## 1 · The check inside the email

This is the part worth the article. Every email the relay sends includes a
**`DKIM-Signature` header**: a cryptographic signature over the message, produced with a
private key held by the email service. The **public halves** are published by the platform as
two DNS CNAME records (two DKIM selectors, so keys can rotate without an outage). Any
receiving mail server — Gmail, Outlook, anything — looks up those records and **verifies the
signature on arrival**.

That verification is an *origin proof*, not a formality:

- **The message provably came from this platform's sending domain** — nobody without the
  private key can produce a valid signature for `notifications.<public-domain>`.
- **The message provably wasn't altered in transit** — the signature covers the body and key
  headers; tamper with an alert's content and the check fails.
- **Spoofed "alerts" fail loudly.** A phisher imitating the platform's Grafana emails fails
  DKIM (no key), fails SPF (wrong sending IPs — a TXT record authorises only the relay's),
  and lands in quarantine instead of an on-call engineer's inbox.

Alert emails are exactly the messages people act on fast and question least — "disk full,
click here" deserves cryptographic provenance.

## 2 · One relay, one identity per tool

The service is deliberately *not* a shared mailbox with a shared password. Each tool gets its
own **sender username** on the domain (`grafana@…`, `airflow@…`) backed by its **own Entra ID
application** — so the From address maps to a real, individually-authenticated identity,
in the spirit of [operator identities](blog-access-as-code). Credentials follow the platform's
secret rules: client secrets live in the **platform services Key Vault** per tier×region
([where tenants can't break them](blog-tenant-keyvaults)), expire after a year, and **rotate
automatically** — a `time_rotating` Terraform resource trips the rotation at plan time, the
old Entra secret is revoked only after the new one is written, and Key Vault's near-expiry
events feed the alerting. Adding a tool is one map entry in tfvars; six resources and a sender
address appear on the next apply.

## 3 · Trust is established before the first email, in DNS

The interesting deploy detail: the relay is **two-phase by design**. The first apply creates
the email service and outputs four DNS records — the ownership-verification TXT, the SPF TXT,
and the two DKIM CNAMEs. Nothing can send yet. Only after those records are published and the
domain shows **Verified** does a second apply (an explicit `LINK_VERIFIED_DOMAIN=true` gate)
link the domain to the sending service.

That ordering *is* the security model: the ability to send is derived from **demonstrated
control of DNS**, and the origin-proof in §1 works because the same DNS now vouches for the
signatures. The gate exists because linking early fails — the platform makes the trust
ceremony explicit instead of letting a race decide it.

## 4 · What I'd tell a team building one

1. Centralise outbound email early — the tenth tool with its own SMTP creds is how spoofable
   mail and leaked passwords happen.
2. One sender identity per tool, never a shared one — "which system sent this?" should have
   an authenticated answer.
3. Treat the DNS records as part of the deliverable, not an afterthought — unverified domains
   send nothing, and that's the correct default.
4. Wire secret rotation into the same plan/apply loop as everything else; a rotation that
   needs a runbook is a rotation that gets skipped.

## Related

[Nobody holds standing power](blog-access-as-code) ·
[Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Identity & PIM](identity-pim) · [✍️ all articles](blog-index)
