# 🧅 The OSI model, one layer at a time — and where each one runs here

> 💡 **TL;DR** — the seven layers aren't trivia for an exam; they're a map of *where a
> decision belongs*. Most platform bugs are someone solving an L7 problem with an L3 tool, or
> the reverse. This platform puts each concern on its own layer with its own owner: packet
> filtering at L3/4, load balancing at L4, routing and policy at L7, and names resolved
> privately underneath it all. Knowing the layer tells you which repo to open.

## 1 · Why the layers still matter

The OSI model is a stack of questions, bottom to top: *is there a link? can packets route? is
the connection reliable? is the session authenticated? is the payload framed? encoded? and
finally — does the application understand it?* You rarely touch all seven, but every network
control you write lives on exactly one, and putting it on the wrong one is how you get a rule
that's either too blunt (blocks a whole subnet to stop one URL) or too porous (an app-level
allow-list that a raw socket walks straight past).

## 2 · L3 / L4 — packets and ports, before any app exists

The lowest layers this platform reasons about are **network (L3)** and **transport (L4)**.
Here live the [NSGs](res-nsg): default-deny rules per subnet, expressed as
CIDR ranges and port numbers — no notion of *what* the traffic is, only *where from, where to,
which port*. The [hub-and-spoke topology](network-hub-spoke) is pure L3 routing:
every spoke's path crosses the inspected hub, and spokes never peer with each other. Load
balancing across cluster nodes is L4 — a connection distributed by tuple, indifferent to the
HTTP inside it. Get this layer right and the higher ones have less to defend.

## 3 · L7 — where the platform spends most of its attention

The **application layer** is where intent finally appears: hostnames, paths, methods, headers.
That's why the [WAF](waf) and [ingress](res-ingress-waf) sit here — an L7
firewall inspects the request body a NSG can't see, and an [HTTPRoute](res-httproute)
splits traffic by path and header, not by IP. Rate limits, TLS termination, request
authentication: all L7, all in front of the workload. The rule of thumb — *the more the
control needs to understand the request, the higher the layer it belongs on* — is why a "block
this attack" ticket almost always lands at L7, not in a NSG.

## 4 · The layer underneath everything — names

DNS isn't a numbered OSI layer, but nothing above L3 works without it. This platform resolves
service names on [private DNS zones](res-private-dns) so a spoke reaches a data
service by name over the inspected path, never over the public internet. Names are the seam
between "where" (L3) and "what" (L7): change a record and every layer above follows.

## 5 · What I'd tell a team debugging across layers

1. **Name the layer first.** "It's slow" at L4 (retransmits) and "it's slow" at L7 (a 3s
   backend) are different bugs with different tools.
2. **Push controls as low as they'll go without losing meaning** — an L3 deny is cheaper than
   an L7 inspection, but only L7 can tell one URL from another.
3. **A control on the wrong layer is a false sense of safety.** An app allow-list doesn't
   contain a workload that can open its own sockets — that's an L3 job.

## Related

[Hub-and-spoke deep dive](network-hub-spoke) · [NSGs](res-nsg) · [WAF](waf) ·
[Ingress & HTTPRoute](res-httproute) · [Private DNS](res-private-dns) ·
[Idempotency & desired state](blog-idempotency) · [✍️ all articles](blog-index)
