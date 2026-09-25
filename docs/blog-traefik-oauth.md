# 🔐 One gateway, one login: SSO for every tenant route

> 💡 **TL;DR** — nobody should implement login twice. The platform runs
> [ONE shared Traefik gateway](landscape-traefik) per cluster; every tenant attaches
> `HTTPRoute`s to it, and authentication is an **oauth2-proxy that sits in front of the app,
> not inside it** — as forwardAuth middleware on the gateway, or as a
> [sidecar](blog-sidecar-patterns) in the tenant's own pod (this platform's default). Apps
> receive `X-Auth-Request-User` and never see a token flow.

## 1 · Auth is infrastructure, not app code

The recurring failure mode: five internal tools, five half-finished login pages, five places
to rotate a client secret. The fix is architectural — move the OAuth dance (redirect →
provider → callback → session cookie) out of the apps entirely and let the routing layer
enforce it. An app behind the gate reads an identity header; it has no OAuth code to get
wrong.

## 2 · Two placements, one proxy

**forwardAuth middleware (central).** Traefik intercepts each request and asks oauth2-proxy's
`/oauth2/auth` endpoint "is this session valid?" — forwarding identity headers downstream on
yes, redirecting into `/oauth2/sign_in` on no. The elegant detail from the writeup this
pattern follows: **stack an errors middleware on top**, so a 401/403 from the *application
itself* also redirects into login — auth failures and authorization failures land in the same
flow, no forked ingress controller required.

**Sidecar (per tenant — the default here).** Each tenant pod carries oauth2-proxy as a
[sidecar](blog-sidecar-patterns); the tenant's `HTTPRoute` targets the **sidecar's port
(:4180)**, and the sidecar proxies localhost to the app. Costs one small container per pod,
buys per-tenant blast radius: each tenant gets its own OIDC client, its own cookie secret,
its own allowed group — a leaked cookie or a misconfigured client stays [one tenant's
problem](blog-tenant-isolation), which is the whole multi-tenancy contract.

## 3 · Why the platform prefers the sidecar

The central middleware is less YAML — but it makes the gateway hold *every* tenant's auth
config, and the [shared gateway](landscape-traefik) is deliberately dumb: it routes. Identity
config belongs to the tenant, versioned in the tenant's own manifests next to the app it
protects. Same argument as [access-as-code](blog-access-as-code): the grant lives where the
owner can review it.

## 4 · What I'd tell you before adopting

1. **Cookie secrets are secrets** — they come from [External Secrets](landscape-external-secrets),
   never inline YAML, and each tenant gets its own.
2. **Health probes bypass the proxy** — probe the app container directly, or a deploy rollout
   turns into a login redirect loop.
3. **Don't double-authenticate** — the [edge WAF](res-ingress-waf) filters, the proxy
   authenticates; keep each layer's one job.

---
*The middleware-stacking pattern is from Lee John Martin's
[Traefik + OAuth proxy on Kubernetes](https://www.leejohnmartin.co.uk/infrastructure/kubernetes/2022/05/31/traefik-oauth-proxy.html) —
distilled here against how this platform wires the sidecar variant per tenant.*
