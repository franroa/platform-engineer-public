# 🚪 A raw model key is a budget with no owner and no off switch

> 💡 **TL;DR** — handing a team a model API key hands them an **ungoverned spend line and an
> unrevocable credential** in one move: no per-app identity, no token budget, no usage trail,
> and rotation that breaks everyone at once. So model keys never leave the platform here.
> Every AI call goes through a **GenAI gateway** — an API Management facade that speaks the
> OpenAI API, authenticates each application with its own subscription key, enforces a hard
> token budget per app, meters usage per app × model, and reaches the model backend with a
> managed identity. Clients change one line: `base_url`.

## 1 · The five-minute answer, again

A team wants to call a model. The five-minute answer is to create a key in the model workspace
and paste it into their secrets. It works on the first try — and now you have a **bearer
credential** with the same disease as [a SAS token](blog-storage-proxy): the key carries no
identity, so the workspace can't tell the portal, the batch job and the intern's notebook
apart. The bill arrives as one number. Rate limits are whatever the workspace defaults to,
shared by everyone. And when the key leaks, rotating it breaks every consumer at once —
which is exactly why nobody rotates it.

Multiply by ten teams and you have ten copies of the same ungoverned key, or worse: ten
*different* keys minted ad hoc, none of them inventoried, none of them in code.

## 2 · One control point, not ten agreements

The fix is structural, not procedural: put a **gateway** between every client and the model,
and make it the only thing that holds model credentials. Ours is an API Management instance
with the GenAI policies enabled, and it gives us four controls in one place:

- **Per-application keys** — each app gets its own gateway subscription; issued and revoked
  without touching the model or any other app.
- **Token budgets** — the `llm-token-limit` policy enforces tokens-per-minute *per
  subscription* (50k TPM sandbox / 100k TPM live). Over budget is a hard `429` with
  `Retry-After`, not a bigger invoice.
- **Metering** — `llm-emit-token-metric` emits usage dimensioned by **subscription and
  model**, so "who spent what on which model" is a dashboard query, not archaeology.
- **No standing model keys** — the gateway authenticates to the model backend with its
  **managed identity**, the same [no-standing-credentials rule](identity-pim) the rest of the
  platform runs on. There is no model key to leak because there is no model key.

The part that makes adoption free: the gateway is **OpenAI-compatible**. Clients keep the SDK
they already use and change the base URL:

```python
from openai import OpenAI

key = os.environ["GATEWAY_API_KEY"]  # this app's subscription key, not a model key
client = OpenAI(
    base_url="https://api.nimbus.example/llm/v1",
    api_key=key,
    default_headers={"Ocp-Apim-Subscription-Key": key},
)
```

The one gotcha worth stating: the OpenAI SDK sends its key as `Authorization: Bearer`, which
API Management ignores — the subscription key must **also** travel in the
`Ocp-Apim-Subscription-Key` header. One `default_headers` line, easy to miss, instantly
obvious once you know.

## 3 · Three tiers, declared as code

The AI layer is three repos with a one-way dependency chain, each reading the previous tier's
Terraform remote state:

```
ai-foundry  →  ai-gateway  →  ai-subscriptions
 (models)      (the facade)     (who may call it)
```

- **`ai-foundry`** owns the shared model workspace and its GPT-5.x deployments. Adding a
  model is a tfvars entry and an MR; clients select it by name in the request. Deploys are
  **manual on main** — model changes are impactful.
- **`ai-gateway`** owns the facade: the API, the policies, the metering, sandbox and live
  workspaces. Sandbox auto-deploys; live (VNet-integrated) is a deliberate manual step.
- **`ai-subscriptions`** owns access. One YAML entry per application:

```yaml
subscriptions:
  - name: fabrikam-portal
    tenant: fabrikam
    tier: live
```

Merge auto-applies, the key comes out of `terraform output`, and it's handed over through the
secrets manager — never chat. This is [access-as-code](blog-access-as-code) applied to the AI
data plane: *which app may call the models, under which budget* is a reviewable diff, not a
favor someone did in a portal. The gateway itself is a platform service like any other — it
shows up in the [live map](ai-ultraplatform) next to the platform API, not as a snowflake.

## 4 · What we deliberately did not build yet

A gateway is also the place where future controls become policy edits instead of migrations —
which is precisely why it ships *first*, thin, rather than later, complete:

- **Multi-model routing** (Claude et al. behind the same facade) — blocked on the unified
  model API reaching our gateway tier; when it lands, it's a gateway change, zero client
  changes.
- **Semantic caching** — needs a managed Redis; pure cost play for repetitive dev traffic.
- **Content safety** — one policy plus one resource, when a use case demands it.
- **Monthly budgets** — `llm-token-limit` grows `tokens-per-month`; a policy attribute, not
  a new system.

None of these are possible retroactively if ten teams already hold raw keys. All of them are
one MR because nobody does.

## 5 · The cost of the other way

Skip the gateway and each team's five-minute key quietly becomes load-bearing. The first
surprise invoice has no per-team breakdown. The first leaked key forces a rotation that takes
down every consumer in one afternoon. The first "which app is hammering the flagship model?"
has no answer because the workspace sees one anonymous bearer. You will build the gateway
anyway that week — under incident pressure, migrating ten teams instead of zero.

A model key is infrastructure's marshmallow test: the shortcut is real, but so is the
compounding cost. Put the door in before anyone moves in.

## Related

- [A SAS token is a one-year password you forgot you minted](blog-storage-proxy) — the same
  bearer-credential disease, storage edition.
- [Access as code](blog-access-as-code) — grants as reviewable diffs.
- [AI · Ultraplatform](ai-ultraplatform) — where the AI layer sits in the platform.
- [Identity & PIM](identity-pim) — the no-standing-credentials rule the gateway extends to models.
