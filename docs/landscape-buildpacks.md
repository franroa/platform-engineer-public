# 📦 Cloud Native Buildpacks — images without Dockerfiles

> 💡 **TL;DR** — [Cloud Native Buildpacks](https://buildpacks.io) turn source code into an
> OCI image without a hand-written Dockerfile: detect the language/runtime, layer the build
> reproducibly, and produce an image on the same hardened base every
> time. Run in-cluster via **kpack**, so a git push is the only input a team ever hands the
> registry — no per-repo Dockerfile to drift, patch or accidentally de-harden.

## The job it does here

- **No Dockerfile to own.** A team's repo declares its runtime (or buildpacks auto-detect
  it); the builder produces the image. Nobody hand-picks a base image, so nobody quietly
  reverts the hardened-base decision in one repo's Dockerfile six months from now.
- **Reproducible, cacheable layers.** Buildpacks separate the app layer from the
  dependency/runtime layers, so a dependency bump rebuilds one layer, not the whole image —
  faster builds, smaller diffs to scan.
- **One place to roll a CVE fix.** Patching the runtime layer means **rebuilding the builder
  image**, not filing an MR against every team's Dockerfile — the same "one owner, every
  consumer inherits the fix" shape as the CI toolchain image.
- **kpack, not a CI-side build step.** The builder runs as an in-cluster controller
  (`Image` CRD watches the git repo / registry tag); a new commit triggers a build without a
  pipeline having to orchestrate `docker build` itself.

## What I'd tell you before adopting

1. Buildpacks are opinionated about layout (a detected `Procfile`/`package.json`/`go.mod`)
   — teams with unusual build steps need a **custom buildpack**, not a workaround Dockerfile,
   or the "no Dockerfile" property quietly erodes.
2. Rebuilding the builder image on every base-image CVE is the whole point — treat that
   rebuild pipeline with the same seriousness as [the CI toolchain image](gitlab-runners).
3. Keep an explicit escape hatch (a reviewed, rare "yes this repo needs a real Dockerfile")
   rather than pretending every workload fits the detected buildpacks — a forced fit becomes
   the next team's support ticket.

## Where it runs

`ns: kpack` · the eu01 hub only (`platform-services/hub/`) — one builder, not one per region,
same rationale as [Backstage](landscape-backstage) and [Grafana](landscape-grafana): a build
result must mean the same thing regardless of which cluster it built in.
Pinned in [`up-kubernetes`](kubernetes) `gitops/platform-services/`.
What a hub outage does (and doesn't) take with it: [if the hub dies](landscape-grafana).

[**▶ See it in the cluster**](#aks=eu01&d=landscape-buildpacks)

## Related

[GitLab runners on Kubernetes](gitlab-runners) · [The golden path](blog-golden-path) ·
[🗺️ landscape](landscape-index)

## ✍️ Related writing

[The sidecar pattern: capabilities a pod wears, not code it imports](blog-sidecar-patterns) ·
[Backstage — the developer portal](landscape-backstage) ·
[Grafana — one pane, run once](landscape-grafana) ·
[The landscape — CNCF & friends I actually run](landscape-index) ·
[cert-manager — certificates as a controller, not a calendar entry](res-cert-manager)
