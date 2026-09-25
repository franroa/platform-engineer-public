# Helm Charts — reusable deployments

> `up-helm-charts` *(the reusable Helm chart library)* · deployed onto *Kubernetes* · into a *Tenant* namespace

`up-helm-charts` is the library of **Helm charts** that describe *how a service runs on Kubernetes* — Deployment, Service, HTTPRoute (with the WAF policy), scaling, probes, config. An application **does not** copy these; it declares them as **chart dependencies** in its own `Chart.yaml`.

## The idea: your app's chart depends on platform charts

```yaml
# an application's chart/Chart.yaml
apiVersion: v2
name: orders-service
version: 0.4.0
dependencies:
  - name: web-service                 # a chart FROM up-helm-charts
    version: 3.1.0
    repository: oci://registry/nimbus/ultraplatform/up-helm-charts
  - name: postgres-connection         # another platform chart
    version: 1.2.0
    repository: oci://registry/nimbus/ultraplatform/up-helm-charts
```

The app then supplies only its own `values.yaml` (image, replicas, routes). `helm dependency update` pulls the platform charts, and the release is assembled from shared, versioned parts.

## What's typically in the library

- **`web-service`** — the standard stateless service (Deployment + Service + HTTPRoute + HPA + probes), wired to the platform's ingress (AGfC) and WAF.
- **`postgres-connection`** — the conventional way a service reaches its database/secrets.
- **worker / cronjob / job** charts for non-web workloads.

## Why chart reuse

- **One correct way to deploy.** Ingress, WAF attachment, scaling and probes are decided once, in the chart — every service inherits them.
- **Versioned (`version:`).** An app pins a chart version and upgrades on its own schedule; a platform-wide fix ships as a new chart version.
- **Thin app charts.** The app repo carries `values.yaml` and its own specifics, not hundreds of lines of Kubernetes YAML.

See the *Example App* for the full picture — chart **+** Terraform modules **+** a GitLab component, all reused.

## ✍️ Related writing

[Multi-tenant Kubernetes without the foot-guns](blog-kubernetes) ·
[Three libraries, one platform](blog-reuse-libraries) ·
[Helm — the packaging grammar](landscape-helm)
