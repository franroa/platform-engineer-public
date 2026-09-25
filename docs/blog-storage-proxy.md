# 🔒 A SAS token is a one-year password you forgot you minted

> 💡 **TL;DR** — a SAS token is a **bearer credential**: whoever holds the URL has the access
> baked into it, for as long as it says. Nothing stops someone minting an account-scoped token
> that stays valid for a **year** — and a single wrong checkbox turns "read one blob" into
> "read, write and delete the whole account." So clients never get SAS tokens here. They talk to
> a **storage proxy** that authenticates with a managed identity, scopes each request, logs it,
> and can be revoked in one place — instead of scattering long-lived secrets we can't recall.

## 1 · The shortcut that looks free

An app needs to read a blob. The five-minute answer is a Shared Access Signature: generate a
SAS URL, hand it to the client, done. It works on the first try, which is exactly the problem —
it works on the *wrong* try too.

```
https://acct.blob.core.windows.net/data/report.csv
  ?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupx&se=2027-03-01T00:00:00Z&sig=…
```

Read that query string as a permission grant, because that's what it is. `sp=rwdlacupx` is
**read, write, delete, list, add, create, update, process** — every verb. `srt=sco` is
**service, container and object** — the whole account, not one blob. `se=2027-…` is the
expiry: this one is good for over a year. None of that required review; it's just how the token
was generated. The URL *is* the credential.

## 2 · Why "bearer" is the whole problem

A SAS token carries no identity. The storage account doesn't know *who* is calling — only that
the caller presented a valid signature. That has three consequences that don't show up until
they hurt:

- **It over-grants by default.** The easy generators produce account-level SAS with broad
  permissions. A token meant to read one report can, misconfigured, delete every container. The
  mistake is silent — the happy path still works, so nothing flags it.
- **It out-lives the reason it existed.** You can mint a token valid for a year, or longer.
  The job that needed it finishes in an hour; the credential keeps working for twelve months,
  sitting in a config file or a log line, waiting.
- **It can't be individually revoked.** A SAS isn't a record you can look up and delete. The
  only real kill switch is rotating the account key — which invalidates **every** token signed
  with it, breaking everyone at once. So in practice nobody revokes, and the tokens live on.

Leak one — into a browser history, a CI log, a screenshot, a committed `.env` — and you've
published a working, long-lived, over-scoped key that you can't cleanly pull back.

## 3 · A proxy puts identity back in front of the data

So clients don't get SAS tokens. They send their request to a small **storage proxy**, and the
proxy is the only thing that talks to the storage account.

```
client ──(authenticated request)──▶  storage proxy  ──(managed identity)──▶  storage account
         who are you? what for?        scope + log                            no public SAS
```

The proxy runs as a [managed identity](blog-access-as-code) with a narrow role — it holds the
access, the client never does. On each call it decides *this identity, this object, this verb*,
fetches the bytes, and returns them. What that buys:

- **Requests carry identity again.** Every call is attributable to a caller, not to an
  anonymous signature. Auth lives in one place instead of in every URL.
- **Access is short-lived by construction.** There's no year-long artifact to leak — the proxy
  authenticates per request against Entra ID and holds nothing a client could carry off.
- **Revocation is instant and surgical.** Remove a caller's grant at the proxy and it's cut off
  now, without rotating a key or breaking anyone else.
- **Misconfiguration is loud, not silent.** Scope is enforced centrally, so an over-broad
  request is denied and logged instead of quietly succeeding.

## 4 · The trade you're actually making

A proxy is a component to run and keep available — a real cost, not a free lunch. But it's the
same trade as [keeping tenant secrets in a vault the tenant can't destroy](blog-tenant-keyvaults):
you accept one well-guarded, well-audited chokepoint so that the alternative — credentials
sprayed across clients, unrevocable and over-scoped — never gets to exist. Storage keys and
account-level SAS stay off by policy; the data plane is reached through identity, or not at all.

The SAS token feels cheaper because its cost is deferred. The bill arrives the day one of those
year-long URLs turns up somewhere it shouldn't — and you go looking for the revoke button that
was never there.

## Related

[Storage Account (resource)](res-storage-account) · [Key Vault (resource)](res-key-vault) ·
[Identity & PIM](identity-pim) · [Your secrets don't live in your resource group](blog-tenant-keyvaults) ·
[Nobody holds standing power](blog-access-as-code) · [✍️ all articles](blog-index)
