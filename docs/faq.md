# FAQ — where do I change…?

A curated starter FAQ for the **Ask** panel. Questions you type into the app are saved in your
browser (FAQ tab) and can be exported here with **Export FAQ (markdown)**.

> The answers use the map's repo **aliases**. See [repos-by-level](repos-by-level.md) for the full table.

### In which repo do I change permissions for a person?
`up-identity` (identities, AD groups, PIM roles), with the RBAC baseline in `up-bootstrap`.

### In which repo do I add a member/owner to a tenant?
`up-tenants` → `config/<tenant>.yml`. A merge request there grants access.

### Where do I change what a pipeline is allowed to do?
Runner/OIDC config in `up-gitlab`; the *allow/deny* is the OPA gate in `up-ci-toolkit/policies/terraform/`.

### Where do I change network reachability (peering, NSGs, subnets)?
`up-network` (network/core). Remote access is `up-vpn` (the P2S VPN).

### Where are WAF rules?
`up-waf` (WAF policies on the Application Gateway / AGfC).

### Where is a tenant's Key Vault / Storage / database defined?
`up-tenants` via `up-modules`, per tenant×region — Key Vault sits in a **separate,
platform-owned RG** the tenant uses but cannot delete.

### Where do I change the AKS cluster / node pools / cluster services?
Cluster & services in `up-kubernetes`; node pools in `up-nodepools`; namespaces in `up-namespaces`.

### Where are the reusable building blocks?
CI components → `up-ci-components` · Terraform modules → `up-modules` · Helm charts → `up-helm-charts`.

---

## Getting deeper answers (optional local backend)

The **Ask** panel answers instantly from the map. To also run a **real code / semantic search**
against the actual GitLab backend (via GitLab Duo and/or GitLab search), run the local proxy in
[`chat-backend/`](../chat-backend/README.md) — it keeps your GitLab token on your machine and is
never part of the public site.
