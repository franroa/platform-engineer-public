# 📉 SLOs and error budgets — turning "is it up?" into a number you can spend

> 💡 **TL;DR** — "reliable" is an argument until you attach a number to it. An SLI measures
> something users feel (latency, success rate); an SLO is the target for that number; the
> **error budget** is what's left over — the amount of failure you're *allowed*, and therefore a
> currency. Spend it on releases when there's budget; stop shipping and fix when there isn't.
> This platform's job is to make the SLIs measurable by default so the conversation is about a
> number, not a vibe.

## 1 · Measure what the user feels, not what's easy

The classic mistake is measuring CPU and calling it reliability. Users don't experience CPU; they
experience slow requests and errors. A good **SLI** is a ratio of good events to total events —
successful requests, requests under 300ms — captured at the point the user actually hits.
That's only possible if every service is instrumented the same way, which is why
[observability is a platform default](observability): consistent request metrics across
every tenant mean an SLI is a query, not a per-team science project.

## 2 · The error budget makes reliability a decision

An SLO of 99.9% success isn't "try to be up." It's a statement that 0.1% failure is *acceptable*
— and that 0.1% is a budget you can spend. Lots of budget left this month? Ship the risky change;
you can afford the occasional blip. Budget exhausted? Freeze features and spend the effort on
stability instead. The budget turns an endless "should we ship or harden?" argument into
arithmetic, and it aligns the incentive: nobody's chasing an impossible 100%, and nobody's
shipping recklessly into a service that's already over its failure allowance.

## 3 · One pane, or it doesn't happen

Numbers nobody looks at don't change behavior. The SLIs, the SLO line and the remaining budget
have to be visible in one place — [Grafana](landscape-grafana) dashboards fed by the
[OpenTelemetry pipeline](blog-otel-operator) — so "how's our budget?" has an answer on a
screen, not in a spreadsheet someone updates monthly. Alerting on *budget burn rate* (are we
spending too fast?) catches trouble earlier than alerting on the raw SLO, because it warns while
there's still budget left to protect.

## 4 · What I'd tell a team adopting SLOs

1. **Pick SLIs users would recognize.** If a metric can be terrible while users are happy (or the
   reverse), it's the wrong metric.
2. **Treat the budget as spendable.** Its purpose is to *permit* risk when you can afford it, not
   only to forbid it when you can't.
3. **Alert on burn rate, not just breaches.** By the time the SLO is blown, the budget's already
   gone — watch how fast it's draining.

## Related

[Observability](observability) · [Grafana — one pane, run once](landscape-grafana) ·
[The OpenTelemetry Operator](blog-otel-operator) · [Well-architected](blog-well-architected) ·
[Idempotency & desired state](blog-idempotency) · [✍️ all articles](blog-index)
