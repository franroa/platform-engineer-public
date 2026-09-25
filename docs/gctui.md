# gctui — the local GitLab-CI cockpit

> A personal tool for working with this platform. Go + Bubble Tea TUI. *(Real snippets from the tool below.)*

`gctui` is a terminal UI that turns the platform's GitLab pipelines into something you can **assemble, run and compare locally** — before anything touches the remote. It replaced a scatter of shell scripts (`gcl` / `glab` / `ci-inject`) with one coherent cockpit.

## What it's for

- **Assemble** pipelines from the platform's reusable **CI components** (the same `up-ci-components` the real pipelines `include:`), so you can compose a run the way production does.
- **Run locally** using `gitlab-ci-local` as the backend engine — full jobs, on your machine, without pushing.
- **Compare local vs remote** — a live **diff** view (`D`) of config and even variable *names*, so you can see exactly where a local run diverges from the real pipeline.
- **Deploy toggle** — a single key flips a job between **local** and **remote** targets (local by default), so the safe thing is the default.

## The guiding principle: local–remote fidelity

The whole point is that **a local run should mirror the remote steps**, and any divergence must be *auditable*, not hidden. That's why:

- Wrappers are **marker-free** — local jobs are byte-identical to the remote job definitions instead of being special-cased.
- The diff view surfaces drift explicitly (config + variable names), so "it worked locally" actually means something.
- Overrides are kept **minimal** on purpose.

## Host-shell toolchain bridge

A platform deploy job runs inside a container with a specific toolchain (Terraform, OPA, Azure CLI, image PATH scripts). When you run such a job as a **host-shell** job, `gctui` **discovers the toolchain from the image itself** (no hard-coded paths) and bridges it onto the host — caching the result per image digest. So the local run has the same tools the container would, without you installing anything.

## Secret-safety

The config file carries **no secrets by default**. Deploy variables are injected at runtime from your host environment, and the diff/config panes list variable **names**, not values.

## The real entry points (Go)

**Assemble** — compose a `.gitlab-ci.yml` from the platform's reusable components (same flags as the retired `ci-inject.sh`):

```go
// runAssemble is the headless `gctui assemble` entry point.
func runAssemble(args []string) error {
    fs := flag.NewFlagSet("assemble", flag.ContinueOnError)
    mode   := fs.String("mode",   "auto", "auto|reuse|remote|skill|both")
    prefer := fs.String("prefer", "auto", "auto|components|jobs")
    // …
    out, log, err := assembler.Assemble(context.Background(), assembler.Options{
        Repo: repo, Mode: *mode, Prefer: *prefer, Semver: *semver, Root: *root,
    })
    // …
}
```

**Run headless** — run one job (or the whole pipeline) locally and return its exit code, with remote as the variable source and runtime injected from host env:

```go
func runHeadless(repo, job string) int {
    local  := backend.NewLocal(abs)
    remote := backend.NewRemote(abs)
    local.EnsureRoot()

    cfg, _ := config.Load(local.Repo())
    local.SetVarSource(remote)          // pull var *names* from remote, values from host
    local.SetRuntime(cfg.Runtime)       // deploy-var injection, secret-safe

    if job == "" {
        code, _ = local.RunPipelineSync(ctx, os.Stdout)
    } else {
        code, _ = local.RunJobSync(ctx, job, os.Stdout)
    }
    return code                         // job's real exit code → scriptable / TDD-able
}
```

`local.SetVarSource(remote)` is the fidelity mechanism: local runs learn which variables the *remote* pipeline expects, while values come from the host environment — so a local run mirrors remote without ever storing secrets. Before a detached `gitlab-ci-local` run, gctui writes a `tflocal` override into the working dir and removes it in the run's cleanup step — the local Terraform half of the same story.

## How it fits the platform

`gctui` is the human's fast feedback loop *around* the delivery engine (**GitLab & Runners**) and the safety gate (**Security & OPA**): compose → run → diff → then push a change you already trust. It also surfaces remote pipeline status and review notifications into the terminal (and tmux), so the cockpit doubles as a monitor.

## ✍️ Related writing

[Attention is the bottleneck — signals from a working agent](blog-claude-signals) ·
[Run the pipeline before you push it](blog-local-remote-ci)
