# ⚖️ Load balancing — L4 moves connections, L7 makes decisions

> 💡 **TL;DR** — "load balancer" names two different machines. An L4 balancer spreads
> *connections* by IP and port, fast and application-blind. An L7 balancer reads the *request* —
> host, path, headers — and routes on meaning. Most platform routing problems are someone asking
> an L4 balancer a question only L7 can answer. This platform uses each where it belongs: L4 for
> raw distribution, L7 at the ingress for routing, TLS termination and policy.

## 1 · Two jobs that share a name

At [L4](blog-osi-model) a balancer sees a connection as a tuple — source, destination,
ports — and picks a backend without knowing or caring what's inside. It's cheap, fast, and
indifferent to HTTP. At L7 the balancer terminates the connection, reads the actual request, and
routes on content: this host to that service, this path to that version, this header to a canary.
The higher layer costs more per request but can make decisions the lower one is structurally
blind to. Neither is "better" — they answer different questions.

## 2 · Where each lives here

Spreading traffic across cluster nodes and raw connection distribution is L4 work — the
[NAT gateway](res-nat-gateway) and node-level balancing move packets without inspecting
them. The moment routing depends on *what the request is*, it moves up to the
[ingress + WAF](res-ingress-waf) and [HTTPRoute](res-httproute): host- and
path-based routing, TLS termination, header rules, WAF inspection. The rule of thumb — *route on
tuples at L4, route on meaning at L7* — tells you which one a given requirement belongs to before
you write it.

## 3 · The health check is the whole point

A balancer that sends traffic to a dead backend is worse than no balancer — it launders failures
into intermittent errors. What makes load balancing a *reliability* tool rather than just a
sprayer is the health check: the balancer must know which backends are actually ready, drain the
ones that aren't, and route around them. This is the same instinct as
[replacing rather than repairing](blog-replace-dont-repair) — an unhealthy backend gets
taken out of rotation and replaced, not nursed while it serves errors.

## 4 · What I'd tell a team designing routing

1. **Name the layer the requirement lives on.** "Send `/api` to the new version" is L7; "spread
   these connections" is L4. Putting it on the wrong layer is how routing gets baroque.
2. **Make health checks meaningful.** "Is the port open?" is not "is the app ready?" — check the
   thing that actually predicts a good response.
3. **Terminate TLS at L7 where you route.** That's where you can read the request to route it
   anyway — [and inspect it](blog-tls-rotation) while it's in the clear.

## Related

[Ingress & WAF](res-ingress-waf) · [HTTPRoute](res-httproute) · [NAT gateway](res-nat-gateway) ·
[The OSI model](blog-osi-model) · [Replace, don't repair](blog-replace-dont-repair) ·
[TLS & rotation](blog-tls-rotation) · [✍️ all articles](blog-index)
