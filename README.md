# Sandbox Template

This repo is a reusable, declarative sandbox template for isolated tool and research environments.

The sandbox configuration is the product here. Research notes, app state, and experiments should stay separate from the sandbox framework itself.

By default, the running container does not mount this repo as its live workspace. The repo defines the image and bootstrap behavior, while the live workspace and home state live in Docker-managed volumes.

## Quick Start

Start the sandbox:

```bash
./bin/sandbox
```

Export a timestamped snapshot of the live workspace without mutating it:

```bash
./bin/sandbox export
./bin/sandbox export workspace
./bin/sandbox export home
```

Sync repo-owned shell, prompt, editor, and workspace-seed control-plane files into the persistent sandbox state without rebuilding the image:

```bash
./bin/sandbox sync
```

Index harness-agnostic skills from the live workspace without copying their contents into the repo:

```bash
./bin/sandbox skills index
```

Audit live workspace skills against the repo's conservative hard-coded leakage checks:

```bash
./bin/sandbox skills audit
```

Export selected skills into a host-side review area before any promotion:

```bash
./bin/sandbox skills export --all
./bin/sandbox skills export agents:skill-name claude:other-skill
```

Read the hook and formatting policy:

```bash
open FORMATTING.md
```

Read the high-level operator experience guide:

```bash
open ERGONOMICS.md
```

## Principles

- Prefer declarative configuration over one-off shell setup.
- Prefer explicit runtime guardrails over implicit trust.
- Prefer terminal-native defaults for day-to-day work inside the container.
- Keep host integrations read-only unless write access is truly required.
- Keep sandbox state out of the repo by default.
- Keep the structure generic enough to reuse in other research repos.
- Remove dead files and unused configuration quickly.

## Skill Philosophy

This repo's top-level skills are curated platform assets, not a mirror of whatever currently exists inside a live research workspace.

In practice, many repo-level skills start as workspace-local skills inside the container, then get pulled up into this repo only after they are heavily generalized and stripped of product-specific context.

That means:

- workspace skills can diverge completely from repo-level skills
- workspace skills can stay highly tactical and tied to current research
- repo-level skills should stay reusable, public-safe, and environment-focused

This separation is intentional. In an agent-heavy workflow, the surrounding system often accumulates too much incidental context across checked-out repos, global skills, local conventions, and past experiments. A managed container workspace helps reduce that context pollution so research can happen in a cleaner and more unbiased environment.

## Layout

- `config/flake.nix`: Nix composition root
- `config/nix/tool-groups.nix`: categorized Nix packages
- `config/nix/shell-hook.nix`: shared shell bootstrap
- `bin/sandbox`: Docker launcher
- `bin/sandbox-measure`: size and startup measurements
- `bin/entrypoint.sh`: in-container startup
- `config/bootstrap-workspace.sh`: first-run workspace bootstrap
- `config/sync-control-plane.sh`: sync repo-owned control-plane files into sandbox state
- `config/skills-catalog.mjs`: metadata-first workspace skill indexing and export helper
- `config/skills-audit-ignore.example.txt`: optional local suppressions for conservative skills audit findings
- `config/sandbox.example.jsonc`: commented launcher defaults template
- `config/read-config.mjs`: JSONC reader for launcher scripts
- `config/shell/`: repo-owned shell snippets layered into sandbox startup
- `.pre-commit-config.yaml`: `prek` hook configuration
- `FORMATTING.md`: hook policy and rationale for custom settings
- `ERGONOMICS.md`: high-level operator experience inside the sandbox
- `config/host-mounts.sh`: host mount helpers
- `config/runtime-flags.sh`: runtime hardening defaults
- `config/guardrails.sh`: measurement defaults and size limits
- `config/nvim/`: repo-owned Neovim and LazyVim config
- `config/`: shell UX files

## Adding Tools

Add new packages in `config/nix/tool-groups.nix` under the right category.

Current categories:

- `ai`
- `core`
- `editors`
- `vcs`

Then rebuild and verify inside the sandbox.

## Formatting And Hooks

This repo uses `prek`, the fast Rust-based pre-commit alternative, for local hook execution.

The tracked hook config lives in `.pre-commit-config.yaml`. It intentionally uses `repo: builtin` for the common hygiene hooks, which means the config is optimized for `prek` rather than stock `pre-commit`.

See `FORMATTING.md` for the exact hook policy and the reasoning behind each non-default setting.

If the host does not already have a native `prek` binary, install the repo's sandbox-backed local hook shim with:

```bash
./bin/install-hooks
```

That hook uses `bin/prek-in-sandbox`, which runs `prek` inside the sandbox image against the repo bind-mounted as the workspace.

Once GitHub is configured for this repo, the `.github/workflows/prek.yml` workflow should also be marked as a required check in branch protection.

## Host Integrations

Current host integrations:

- GitHub CLI config
- Git config

Add new mounts in `config/host-mounts.sh` and wire them in `bin/sandbox`.

Neovim and LazyVim are repo-owned and live under `config/nvim`. They are synced into sandbox state on startup so plugin metadata can be written without mutating the source config.

Shell features that are likely to grow over time live under `config/shell/`. For example, the FZF Ctrl-R history integration is kept in its own snippet instead of being inlined into `config/bashrc`.

## State

The sandbox home and workspace both live in Docker named volumes by default, so they persist across runs without polluting the repo.

Default volumes:

- sandbox home
- workspace

If you explicitly want a host bind mount instead:

```bash
SANDBOX_HOME_BIND="$PWD/.sandbox-home" ./bin/sandbox
```

If you explicitly want a host bind mount for the live workspace instead:

```bash
SANDBOX_WORKSPACE_BIND="$PWD/workspace" ./bin/sandbox
```

Use `./bin/sandbox export` or `./bin/sandbox export workspace` to snapshot the current live workspace into a timestamped directory under `exports/`. In the default Docker-volume mode it copies from the workspace volume. If you are using `SANDBOX_WORKSPACE_BIND`, it snapshots that bind-mounted workspace path instead.

Use `./bin/sandbox export home` to snapshot the persistent sandbox home under `exports/`. This captures user-level sandbox state such as `~/.config`, `~/.local/share`, editor state, and global tool state like OpenCode's database.

Use `./bin/sandbox sync` to push repo-owned control-plane files into the current persistent home and workspace state without rebuilding the image. This is the preferred path for `config/bashrc`, `config/starship.toml`, `config/nvim/`, and `config/workspace-seed/` changes.

Use `./bin/sandbox skills index` to inspect harness-agnostic skill metadata from the live workspace without copying content into tracked repo paths. Use `./bin/sandbox skills export ...` to copy selected skills into `exports/skills/<timestamp>/` for manual review. This workflow is intentionally metadata-first so product research stays in the workspace unless you explicitly export and curate it.

Use `./bin/sandbox skills audit` before promotion to apply a conservative, hard-coded leakage screen for this template repo. The default rules intentionally look for workspace-coupled paths, product-research wording, internal-context terms, the template author's common personal identifiers, and email-like strings. This is not a general compliance scanner; it exists to reduce the chance of accidentally promoting personal research details into an open-source repo.

If the conservative audit flags a harmless term in your own workflow, you can add a local suppression in `config/skills-audit-ignore.txt` using `config/skills-audit-ignore.example.txt` as a template. That ignore file is intentionally local-only and untracked.

This repo also includes `.github/workflows/skills-audit.yml` so that, once the project is connected to GitHub, pull requests can be gated on the same conservative repo-level skill audit. To make it a real merge gate, mark the `Skills Audit` workflow check as required in branch protection.

The intended promotion flow is:

- create or iterate on skills freely inside the container workspace
- index and audit them from the host without mutating the workspace
- export them for review
- only then promote the ones that are generalized enough for the repo-level public template

## Workspace Bootstrap

On first boot, an empty workspace volume is initialized inside the container.

Current default bootstrap:

- create `content/`
- clone and initialize Quartz into `quartz/`

That bootstrap happens inside the workspace volume, not in this repo.

## Measurement

Use the measurement helper to track image size, sandbox-home size, and startup time:

```bash
./bin/sandbox-measure
```

## Runtime Hardening

By default the sandbox runs with:

- dropped Linux capabilities
- `no-new-privileges`
- a read-only container root filesystem
- writable tmpfs mounts for temporary paths
- a writable Docker-managed sandbox home volume

If you need to relax that temporarily:

```bash
SANDBOX_DISABLE_HARDENING=1 ./bin/sandbox
```

Most launcher defaults live in `config/sandbox.example.jsonc`, with optional local overrides in `config/sandbox.jsonc` and environment variables kept as temporary overrides.

Image-baked changes such as Nix package additions in `config/nix/tool-groups.nix` still require a later `./bin/sandbox --rebuild` to become available inside the container.

If you want a local override file:

```bash
cp config/sandbox.example.jsonc config/sandbox.jsonc
```
