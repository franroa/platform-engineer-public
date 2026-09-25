# 💻 Developer laptop

> 💡 **TL;DR** — the laptop is the **untrusted edge** of the platform: where agentic
> development happens (Claude Code, editors, SDKs) and where credentials go to get lost.
> The design rule: a laptop holds *revocable, personal, budgeted* keys — never a raw
> credential to a shared backend.

| Property | Value |
| --- | --- |
| **Scope** | outside every trust boundary — the consumer end of each flow |
| **Reaches the platform via** | P2S VPN (operators) · [AI gateway](res-apim.md) (AI traffic) |

## 🧠 The concept
Every arrow on this map that starts outside the cloud starts at a laptop. The platform
never trusts the device; it narrows what the device can *hold*:

- **Operators** reach infrastructure through the P2S VPN with Entra ID — identity, not
  network position, is the credential.
- **AI / agentic development** talks to models through the AI gateway with a **personal
  APIM subscription key**: per-user, token-budgeted (`429 + Retry-After` past the cap),
  metered per user × model, revocable in one Terraform apply. `ANTHROPIC_BASE_URL` points
  Claude Code at the gateway and nothing else changes.

## 🏗️ Why it's drawn on the map
The gateway's whole reason to exist is *this* edge: developers running AI tooling locally,
against models the platform hosts. Drawing the laptop makes the flow honest — the
connector connects **from** somewhere: laptop → APIM gateway → AI Foundry.

## ⚙️ Lifecycle & change
Keys are issued per person under the gateway's product, shared through the secrets manager
(never chat or email), and revoked by deleting one subscription — the laptop never needs
to be trusted, only cut off.

## 🔗 Related concepts
The laptop is the start of two of the map's arrows: the **operator** path through the
[VPN Gateway](res-vpn-gateway.md) into the [hub-and-spoke network](network-hub-spoke.md),
and the **AI** path through the [API Management gateway](res-apim.md) to
[Azure AI Foundry](res-ai-foundry.md). The whole AI ecosystem is described in
[AI · the intelligence layer](ai-ultraplatform.md).
