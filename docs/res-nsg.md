# 🛡️ Network Security Group (NSG)

> 💡 **TL;DR** — the NSG is the **firewall rulebook of a subnet**: ordered allow/deny rules
> evaluated by priority. If subnets decide *who sits together*, NSGs decide *who may talk*.

| Property | Value |
| --- | --- |
| **Scope** | per [subnet](res-subnet.md) (can also bind per NIC — we bind per subnet) |
| **Created by** | `up-network`, next to the subnet it guards |
| **IaC type** | `azurerm_network_security_group` + `azurerm_network_security_rule` |

## 🧠 The concept
An NSG is a stateful L3/L4 filter: 5-tuple rules (src, src-port, dst, dst-port, protocol),
each with a **priority** (lower wins) and an action. Return traffic of an allowed flow is
automatically allowed (stateful). Two rule directions (inbound/outbound) and built-in
default rules at the bottom (allow VNet↔VNet, deny internet inbound).

Mental model: **the NSG is documentation that enforces itself** — the rule list *is* the
statement of what this subnet is allowed to do.

## 🏗️ How it's used in this platform
- Every workload subnet gets a **default-deny inbound** NSG; each opening is an explicit,
  reviewed terraform rule (the live security inventory lists every
  `azurerm_network_security_rule` in the group's code).
- Platform-level segmentation (region baseline, VPN reach, management paths) is enforced in
  the **hub firewall rules**; NSGs handle the *local* subnet policy. Two layers, two owners.
- NSG **flow logs** feed the observability stack — every allowed/denied flow is queryable.

## ⚙️ Lifecycle & change
Changing network policy = a rule change in `up-network`, through plan → OPA → apply.
The OPA gate (`up-policies`) can block rules that violate policy (e.g. `0.0.0.0/0` inbound).

## ✅ Best practices we apply
- **Default-deny, allow-list** — never start from allow-all and subtract.
- Leave **priority gaps** (100, 200, 300 …) so insertions don't renumber everything.
- Use **service tags** (`AzureCloud`, `VirtualNetwork`) instead of maintained IP lists.
- One NSG per subnet, defined next to it — no shared mega-NSGs.

## ⚠️ Gotchas
- NSGs are **stateful** — you don't need (and shouldn't write) mirror rules for replies.
- Special subnets (`GatewaySubnet`) reject or restrict NSGs by design.
- NSG ≠ firewall: no TLS inspection, no FQDN rules — that's the hub firewall's job.

## 🔗 Related
[Subnet](res-subnet.md) · [VNet](res-vnet.md) · [network-hub-spoke](network-hub-spoke.md) ·
[security-opa](security-opa.md)

---
**Repo (map alias):** `up-network` · See [repos-by-level](repos-by-level.md).

## ✍️ Related writing

[The OSI model, one layer at a time — and where each one runs here](blog-osi-model) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform) ·
[Cilium — the CNI, chosen at cluster creation, not GitOps'd in later](landscape-cilium)
