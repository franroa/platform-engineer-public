# tflocal — local-only Terraform overrides

> A personal tool for working with this platform. Go library + CLI, extracted from `gctui`. *(Real snippets from the tool below.)*

`tflocal` solves one focused problem: **run the platform's Terraform locally, safely, then leave no trace.** It does this with Terraform's native **override** mechanism (`*_override.tf`) — drop in local-only overrides before a run, then clean them up afterwards.

## Why overrides?

The platform's modules are written for CI: they assume operator identities, remote state backends, injected variables. To plan/apply one on your laptop you need to *adjust* a few things — a backend, a provider, a variable — **without editing the real files** (which would risk committing local hacks or diverging from remote).

Terraform's rule is that any file ending in `_override.tf` is **merged on top** of the base config. `tflocal` uses exactly that:

```
main.tf                 # the real module, untouched
_local_override.tf      # tflocal writes this: local backend / provider / vars
                        # → merged over main.tf only for this local run
```

## The lifecycle: apply then clean

```
1. write   overrides  → drop *_override.tf into the module dir
2. run     terraform  → plan / apply locally, overrides in effect
3. cleanup overrides  → remove the *_override.tf files
```

Step 3 is the important one: the working tree ends up **exactly as it started**, so nothing local can accidentally be committed or pushed. Fidelity with remote is preserved because the base module is never touched.

## Library + CLI, shared with gctui

`tflocal` is both a **CLI** you can run by hand and a **Go library** that `gctui` imports (via a module `replace`) so both tools apply overrides the same way. The override shape is a shared type — `gctui`'s override config is a thin alias over `tflocal`'s — so there is one definition of "what a local override is", used everywhere.

## The real core (Go)

The whole library is one small value type plus apply/cleanup. An `Override` is a path (which **must** end in a suffix Terraform auto-merges) and verbatim content:

```go
// Override is a single local-only Terraform override file. Path is relative to
// the run root and MUST end in `_override.tf` or `_override.tf.json` so Terraform
// auto-merges it. Content is written verbatim.
type Override struct {
    Path    string `yaml:"path"`    // relative to the run root; must end in _override.tf[.json]
    Content string `yaml:"content"` // the HCL (or JSON) written verbatim
}

func (o Override) Active() bool { return o.Path != "" && o.Content != "" }
```

`Validate()` refuses absolute paths, `..` traversal outside the root, and any suffix Terraform won't merge. Then two entry points — one for out-of-process cleanup, one for `defer`:

```go
// Apply validates and writes the override under root, returning the abs paths it
// wrote (caller cleans up — suits a detached wrapper that cleans up even if the
// parent exited).
func (o Override) Apply(root string) (written []string, err error) {
    if !o.Active() { return nil, nil }
    if err := o.Validate(); err != nil { return nil, err }
    abs := filepath.Join(root, o.Path)
    os.MkdirAll(filepath.Dir(abs), 0o755)
    os.WriteFile(abs, []byte(o.Content), 0o644)
    return []string{abs}, nil
}

// ApplyWithCleanup suits in-process callers that can `defer cleanup()`.
func (o Override) ApplyWithCleanup(root string) (cleanup func() error, err error) {
    written, err := o.Apply(root)
    if err != nil { return func() error { return nil }, err }
    return func() error { return removeAll(written) }, nil
}
```

The CLI (`tflocal run … -- <command>`) applies the override, runs the command, and removes the override **even if the command is interrupted** — the working tree is always left exactly as it was found. Because the YAML tags are on the type itself, `gctui` embeds it directly (its `config.TerraformOverride` is an alias of this `Override`), so there is one definition of a local override shared by both tools.

## How it fits the platform

`tflocal` is the **Terraform half** of the local-fidelity story that `gctui` orchestrates: it lets you exercise a real platform module (network, hub, tenants…) against real cloud state locally, get the same plan you'd get in CI, and then vanish without a diff. Minimal overrides, auditable divergence, clean tree — the same principles as the rest of the platform.
