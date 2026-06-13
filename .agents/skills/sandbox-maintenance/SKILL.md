# Sandbox Maintenance

## Scope

Maintain the sandbox infrastructure in this repo with the least disruptive rollout path available.

Prefer changes that preserve the current containerized workspace session and avoid image rebuilds unless the requested surface truly requires one.

## Use When

- Changing `bin/sandbox` host-side behavior
- Updating repo-owned shell, prompt, editor, or workspace-seed config
- Deciding whether a sandbox request needs `sync`, restart, or rebuild
- Provisioning tools through Nix
- Adding or adjusting Docker runtime flags, mounts, or published ports

## Disruption Levels

### 1. Live Sync

Use `./bin/sandbox sync` when the change only touches control-plane assets that can be copied into persistent home or workspace state.

Typical surfaces:

- `config/bashrc`
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

## Workflow

1. Inspect the requested files before choosing an approach.
2. Classify the change as live-syncable, restart-required, or rebuild-required.
3. Prefer `./bin/sandbox sync` over restart, and restart over rebuild.
4. Before restart- or rebuild-class changes, consider `./bin/sandbox export` if the user may want a point-in-time workspace snapshot.
5. Verify with temporary bind-mounted home and workspace paths when possible so active volumes are not disturbed.
6. Update `README.md` only when the user-facing workflow actually changes.

## Main Surfaces

- `bin/sandbox`
- `bin/sandbox-measure`
- `bin/entrypoint.sh`
- `config/bootstrap-workspace.sh`
- `config/sync-control-plane.sh`
- `config/bashrc`
- `config/starship.toml`
- `config/nvim/`
- `config/workspace-seed/`
- `config/runtime-flags.sh`
- `config/host-mounts.sh`
- `config/guardrails.sh`
- `config/flake.nix`
- `config/nix/tool-groups.nix`
- `config/Dockerfile`
- `README.md`
- `to-do.md`

## Commands

```bash
./bin/sandbox sync
./bin/sandbox export
./bin/sandbox --rebuild
SANDBOX_PORTS="8080" ./bin/sandbox
```

## Boundaries

- Do not overwrite live workspace files from `config/workspace-seed/`; seed only missing files.
- Do not rebuild just to roll out shell, prompt, Neovim, or workspace-seed changes.
- Do not change product or research content unless the user explicitly asks.
- Keep host mounts read-only by default.
