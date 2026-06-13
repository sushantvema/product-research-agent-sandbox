# Sandbox Maintenance

## Scope

Maintain the sandbox infrastructure in this repo with the least disruptive rollout path available.

Prefer changes that preserve the current containerized workspace session and avoid image rebuilds unless the requested surface truly requires one.

## Use When

- Changing `bin/sandbox` host-side behavior
- Updating repo-owned shell, prompt, editor, workspace-seed, or hook config
- Deciding whether a sandbox request needs `sync`, restart, or rebuild
- Provisioning tools through Nix
- Adding or adjusting Docker runtime flags, mounts, or published ports
- Maintaining repo-level skills, skill audit rules, or CI guardrails

## Disruption Levels

### 1. Live Sync

Use `./bin/sandbox sync` when the change only touches control-plane assets that can be copied into persistent home or workspace state.

Typical surfaces:

- `config/bashrc`
- `config/shell/`
- `config/starship.toml`
- `config/nvim/`
- `config/workspace-seed/`

### 2. Restart Required

Relaunch the sandbox when the change affects `docker run` arguments but not the image contents.

Typical surfaces:

- published ports via `SANDBOX_PORTS`
- runtime hardening flags
- host mounts
- environment-variable driven launcher behavior

### 3. Rebuild Required

Use `./bin/sandbox --rebuild` only when the image itself must change.

Typical surfaces:

- `config/flake.nix`
- `config/nix/`
- `config/Dockerfile`
- image-baked packages or binaries
- `.pre-commit-config.yaml` when the hook runner itself needs to exist inside the image toolchain

## Workflow

1. Inspect the requested files before choosing an approach.
2. Classify the change as live-syncable, restart-required, or rebuild-required.
3. Prefer `./bin/sandbox sync` over restart, and restart over rebuild.
4. Before restart- or rebuild-class changes, consider `./bin/sandbox export workspace` and `./bin/sandbox export home` if the user may want a point-in-time checkpoint.
5. For workspace-skill curation, prefer `./bin/sandbox skills index`, then `./bin/sandbox skills audit`, then `./bin/sandbox skills export` before any repo-level promotion.
6. Verify with temporary bind-mounted home and workspace paths when possible so active volumes are not disturbed.
7. Update `README.md` and `FORMATTING.md` when the user-facing workflow or hook policy actually changes.

## Main Surfaces

- `bin/sandbox`
- `bin/sandbox-measure`
- `bin/entrypoint.sh`
- `config/bootstrap-workspace.sh`
- `config/sync-control-plane.sh`
- `config/bashrc`
- `config/shell/`
- `config/starship.toml`
- `config/nvim/`
- `config/workspace-seed/`
- `config/skills-catalog.mjs`
- `config/skills-audit-ignore.example.txt`
- `config/runtime-flags.sh`
- `config/host-mounts.sh`
- `config/guardrails.sh`
- `config/flake.nix`
- `config/nix/prek.nix`
- `config/nix/tool-groups.nix`
- `config/Dockerfile`
- `.pre-commit-config.yaml`
- `.github/workflows/skills-audit.yml`
- `.github/workflows/prek.yml`
- `FORMATTING.md`
- `README.md`
- `to-do.md`

## Commands

```bash
./bin/sandbox sync
./bin/sandbox export workspace
./bin/sandbox export home
./bin/sandbox skills index
./bin/sandbox skills audit
./bin/sandbox skills export --all
./bin/sandbox --rebuild
prek run --all-files
SANDBOX_PORTS="8080" ./bin/sandbox
```

## Boundaries

- Do not overwrite live workspace files from `config/workspace-seed/`; seed only missing files.
- Do not rebuild just to roll out shell, prompt, Neovim, workspace-seed, or skill-audit changes.
- Do not promote workspace skills directly into tracked repo paths without auditing and host-side review first.
- Do not change product or research content unless the user explicitly asks.
- Keep host mounts read-only by default.
