# ⌨️ Neovim &amp; CLI tooling

> 💡 **TL;DR** — beyond infrastructure I build **developer tools**: a full Neovim toolchain for
> the **River** configuration language (used by Grafana Alloy), plus contributions to several
> open-source Neovim/CLI projects. Local-first, editor-native, and shaped by day-to-day platform
> work.

## 🛠️ Built by me

### River language toolchain (Grafana Alloy)

The observability stack uses **River** — Grafana Alloy's configuration language. I built the
missing editor experience for it, end to end:

- **[tree-sitter-river](https://github.com/franroa/tree-sitter-river)** — a Tree-sitter grammar
  for River: fast, incremental syntax parsing that powers accurate highlighting, folding and
  structural navigation in any Tree-sitter-capable editor.
- **[river-lsp](https://github.com/franroa/river-lsp)** — a Language Server for River: diagnostics,
  completion and go-to-definition, so Alloy configs get the same IDE-grade feedback as real code.
- **[alloy.nvim](https://github.com/franroa/alloy.nvim)** — the Neovim plugin that wires it all
  together: sensible defaults for editing Alloy/River files, hooking up the grammar and the LSP.

Together these turn "hand-editing YAML-ish config and hoping" into a real, typed editing
experience — the same *shift-left, make-it-legible* instinct behind the platform map itself.

## 🤝 Open-source contributions

- **[easy-dotnet.nvim](https://github.com/GustavEikaas/easy-dotnet.nvim)** — .NET development
  inside Neovim (build, test and run projects without leaving the editor).
- **[atlas.nvim](https://github.com/emrearmagan/atlas.nvim)** — a Neovim plugin I've contributed
  to.
- **[tuicr](https://github.com/agavra/tuicr)** — a terminal-UI developer tool I've contributed to.

## 🔗 Related

[gctui](gctui) — local GitLab-CI cockpit · [tflocal](tflocal) — run Terraform modules locally ·
[Dev Workflow](dev-workflow)

## ✍️ Related writing

[A cockpit for a fleet of agents](blog-agent-cockpit)
