# 🕸️ Hub-and-Spoke Network — the deep dive

> 💡 **TL;DR** — one **hub** VNet per region holds all shared network infrastructure (VPN
> gateway, firewall, bastion, DNS resolver); every workload lives in a **spoke** VNet peered
> to the hub. Spokes never talk to each other directly — every path crosses the hub, so there
> is exactly **one place** to inspect, log, and gate traffic.

| Property | Value |
| --- | --- |
| **Repo (map alias)** | `up-network` |
| **Regions** | eu01 (primary hub, VPN) · us01 · us02 · ca01 |
| **Spokes** | `ultracore-live` · `ultracore-sandbox` · `ultraapps-live` · `ultraapps-sandbox` (sector × tier) |
| **Address plan** | single source of truth: `up-config` → `network.yml` |

## 🧠 Why hub-and-spoke at all?

VNet peering is **non-transitive**: peering A↔B and B↔C does *not* connect A to C. You can
fight that (full mesh: n·(n−1)/2 peerings, no chokepoint) or use it: make one VNet — the hub —
the *B* of every pair. That buys:

1. **One auditable perimeter.** VPN gateway, firewall, flow logs exist **once per region**,
   not once per workload. Every north-south *and* spoke-to-spoke flow crosses a point we own.
2. **Blast-radius isolation.** A compromised spoke sees only the hub — not its neighbours.
   Lateral movement has to pass inspection.
3. **Costs that scale sub-linearly.** Gateways and firewalls are the expensive parts; spokes
   are nearly free. Ten more workloads ≠ ten more gateways.
4. **Growth without re-architecture.** A new subscription/region is *one more spoke/hub* —
   the pattern doesn't change at 4 spokes or 40.

## 🗺️ The shape

```
                    ┌──────────────── hub VNet (per region) ────────────────┐
   you ══ VPN ════▶ │ GatewaySubnet │ bastion │ firewall (+mgmt) │ resolver  │
                    └──────────────────────────┬─────────────────────────────┘
                 ┌──────────────┬──────────────┼──────────────┬──────────────┐
              spoke          spoke          spoke          spoke        (hub us01…)
           ultracore-live    ultracore-sandbox   ultraapps-live   ultraapps-sandbox   ⇡ hub↔hub
                                                                        peering
```

- **Hub subnets are roles, one terraform file each** (`subnet.<name>.tf`): gateway, bastion,
  firewall, firewall-management, resolver-inbound, resolver-outbound. The live map renders
  exactly these files in the region view. Each is a [subnet](res-subnet.md) note of its own.
- **Spoke subnets are workload placement**: node pools, endpoint subnets, data services —
  each with a default-deny [NSG](res-nsg.md).

## 🧭 Routing & inspection

Peering alone would let spokes reach the hub and stop there. Two mechanisms complete it:

- **UDRs (route tables)** on spoke subnets send non-local traffic to the **hub firewall** as
  next hop — the firewall becomes the router between spokes and to the internet.
- **Firewall rule collections** (in code, in `up-network`) define the policy tiers:
  *baseline* (what every region gets), *segmentation* (who may cross between spokes),
  *management* (operator paths), *vpn* (what VPN clients may reach). The live security
  inventory lists these rule collections straight from the code.

So the layering is: NSG = local subnet rulebook · firewall = inter-spoke & egress policy ·
[NAT gateway](res-nat-gateway.md) = stable egress identity.

## 🌍 Cross-region

Each region has its own hub; hubs peer **hub↔hub** (visible as the arcs on the globe).
Because peering is non-transitive, spoke-eu01 → spoke-us01 crosses *both* hubs — by design:
each region's firewall sees what enters and leaves it. The single [VPN](vpn.md) gateway in
eu01 reaches remote regions the same way.

## 📐 Addressing — config, not code

Every CIDR (hub and spoke, per region) is allocated in `up-config`'s `network.yml`.
Because overlapping VNets can never peer, address planning is done **once, centrally, up
front** — modules consume the plan; nobody invents a block in a PR.

## 🔩 Deploy order (and why it's written down)

```
global → dns-root → azure-global → subscription → spoke → dns → hub → flowlogs → peering
```

Foundations before subscriptions; spokes before the hub **that discovers and peers them**;
DNS zones before the hub resolver that serves them; peering and flow logs last. The hub
*discovers* spokes via data sources (no hand-registration), which is also the performance
trick: direct Azure data sources instead of loading whole remote states.

## ✅ Design rules we enforce

- Spokes **never** peer to each other — no exceptions, no "temporary" links.
- The hub carries **no workloads** — infrastructure only.
- Every subnet is **one file**, every firewall opening is **one reviewed rule**.
- Flow logs ship to [Log Analytics](res-log-analytics.md) — every flow is queryable.

## ⚠️ Failure modes this design prevents

| Without hub-and-spoke | With it |
| --- | --- |
| n² peering mesh, drift, orphan links | n peerings, generated from state |
| one VPN/firewall **per workload** team | one per region, platform-owned |
| lateral movement between workloads | spokes isolated by default |
| "who can reach what?" = archaeology | firewall rules in code = the answer |

## ⚠️ The trade-off: the hub is also the single point of failure

Centralising the perimeter buys one auditable chokepoint — and makes that chokepoint
load-bearing. Two honest consequences worth naming:

- **eu01 hosts the only VPN gateway.** If the eu01 hub is unhealthy, operators lose the
  P2S door into *every* region, since remote regions are reached *through* eu01
  ([global footprint](global-footprint.md)). Break-glass is the per-region **bastion**
  (its own subnet in each hub) plus Azure-portal/JIT access — deliberately a slower,
  more audited path, not a second standing door.
- **A hub outage degrades spoke-to-spoke and north-south traffic** for that region, because
  every path crosses the hub firewall. The mitigation is boring on purpose: the hub holds
  no workload state, so it rebuilds from code (`up-network`) fast, and its resources carry
  `prevent_destroy`. A second VPN gateway (active/standby in a second region) is the
  obvious next step if operator-access RTO ever needs to beat "rebuild the hub".

The point isn't that hub-and-spoke has no SPOF — it's that the SPOF is **one known,
owned, reproducible place** instead of scattered across every team.

## 🔗 Related
[VNet](res-vnet.md) · [Subnet](res-subnet.md) · [NSG](res-nsg.md) ·
[NAT Gateway](res-nat-gateway.md) · [Private DNS](res-private-dns.md) ·
[Private Endpoint](res-private-endpoint.md) · [vpn](vpn.md) — the one door in

## ✍️ Related writing

[A backup is a tag, not a ticket](blog-backups) ·
[Defense in depth — no single wall, because walls fall](blog-defense-in-depth) ·
[Disaster recovery is a rehearsal, not a binder](blog-disaster-recovery) ·
[DNS is the platform's phone book — and its weakest excuse for an outage](blog-dns) ·
[Grafana Cloud as the observability backend](blog-grafana-cloud) ·
[From on-premises to cloud — migrate the operating model](blog-migration-onprem-cloud) ·
[Moving a platform between Azure subscriptions](blog-migration-subscriptions) ·
[The OSI model, one layer at a time — and where each one runs here](blog-osi-model) ·
[Terraform at scale — scopes, tiers & a policy gate](blog-terraform) ·
[Well-architected is a set of questions, not a badge](blog-well-architected) ·
[External DNS — records follow the routes](landscape-external-dns)
