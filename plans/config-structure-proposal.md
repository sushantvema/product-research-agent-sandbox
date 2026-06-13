# Config Structure Proposal

## Why This Exists

`config/` currently has too many unrelated leaf nodes at one level.

That makes it harder for an outside reader to answer simple questions quickly:

- what changes the built image?
- what only affects runtime behavior?
- what is synced into the sandbox home?
- what shapes the first-run workspace?
- what is optional workflow tooling rather than core sandbox machinery?

This proposal is about making that boundary more legible without creating a deeply nested tree.

## Design Goals

1. Make the tree readable from the outside in.
2. Keep the hierarchy shallow.
3. Group files by destination or responsibility, not by extension.
4. Add very short README files at each meaningful directory boundary.
5. Keep first-touch user configuration files easy to find.

## Heuristics

### 1. Keep only first-touch user config flat

These should stay directly under `config/`:

- `sandbox.example.jsonc`
- `sandbox.jsonc`

These are the files a new user is most likely to look for first.

### 2. Prefer concrete nouns over internal implementation terms

Names like `image`, `home`, and `workspace` are easier to understand than terms like `control-plane`.

### 3. Keep depth low

Under `config/`, most things should be at depth 1 or 2.

The main exception is tool-native trees that are already internally structured, such as `nvim/`.

### 4. Every meaningful directory should explain itself

Each stable directory should have a short `README.md` answering:

- what belongs here
- what does not belong here
- who consumes these files

## Proposed Target Layout

```text
config/
  sandbox.example.jsonc
  sandbox.jsonc
  image/
    README.md
    Dockerfile
    nix/
      README.md
      flake.nix
      shell-hook.nix
      tool-groups.nix
      prek.nix
  runtime/
    README.md
    host-mounts.sh
    runtime-flags.sh
    guardrails.sh
    read-config.mjs
    sync-control-plane.sh
  home/
    README.md
    bashrc
    starship.toml
    shell/
      README.md
      fzf.sh
    nvim/
      README.md
      ...
  workspace/
    README.md
    bootstrap-workspace.sh
    seed/
      README.md
      AGENTS.md
  skills/
    skills-catalog.mjs
    skills-audit-ignore.example.txt
```

## Why This Layout Is Better

### `image/`

Everything here changes what gets baked into the sandbox image.

This is a clear mental bucket for:

- Docker image definition
- Nix package set
- image-time shell hook behavior

### `runtime/`

Everything here affects how the sandbox is launched or managed from the host.

This is the right home for:

- mount rules
- hardening flags
- measurement guardrails
- config parsing helpers
- sync orchestration

### `home/`

Everything here is a repo-owned payload that ends up under `/home/sandbox`.

This makes it obvious that shell config, prompt config, shell snippets, and Neovim config all belong to the same conceptual user-space layer.

### `workspace/`

Everything here affects first-run workspace contents or workspace bootstrap behavior.

That keeps workspace seed content separate from home-state payloads.

### `skills/`

This is optional workflow tooling, not core runtime.

Keeping it separate prevents the sandbox launcher and image config from being mixed with higher-level curation helpers.

## Recommended README Strategy

Every stable directory should get a short README.

### `config/image/README.md`

Explain that this directory contains build-time definitions for the sandbox image.

### `config/image/nix/README.md`

Explain that this is the Nix package and shell composition layer.

### `config/runtime/README.md`

Explain that this is host-side launch and runtime behavior, not user payload.

### `config/home/README.md`

Explain that these files are synced or mounted into `/home/sandbox`.

### `config/home/shell/README.md`

Explain that shell snippets live here when they are worth keeping separate from the main `bashrc`.

### `config/home/nvim/README.md`

Explain that this is a repo-owned editor config tree copied into sandbox home state.

### `config/workspace/README.md`

Explain that these files define the initial workspace and workspace bootstrap behavior.

### `config/workspace/seed/README.md`

Explain that these are copied only when missing and should stay generic.

## Concrete File Moves

### Move Into `image/`

- `config/Dockerfile` -> `config/image/Dockerfile`
- `config/flake.nix` -> `config/image/nix/flake.nix`
- `config/nix/*` -> `config/image/nix/*`

### Move Into `runtime/`

- `config/host-mounts.sh` -> `config/runtime/host-mounts.sh`
- `config/runtime-flags.sh` -> `config/runtime/runtime-flags.sh`
- `config/guardrails.sh` -> `config/runtime/guardrails.sh`
- `config/read-config.mjs` -> `config/runtime/read-config.mjs`
- `config/sync-control-plane.sh` -> `config/runtime/sync-control-plane.sh`

### Move Into `home/`

- `config/bashrc` -> `config/home/bashrc`
- `config/starship.toml` -> `config/home/starship.toml`
- `config/shell/*` -> `config/home/shell/*`
- `config/nvim/*` -> `config/home/nvim/*`

### Move Into `workspace/`

- `config/bootstrap-workspace.sh` -> `config/workspace/bootstrap-workspace.sh`
- `config/workspace-seed/*` -> `config/workspace/seed/*`

### Leave or Move Into `skills/`

- `config/skills-catalog.mjs` -> `config/skills/skills-catalog.mjs`
- `config/skills-audit-ignore.example.txt` -> `config/skills/skills-audit-ignore.example.txt`

## What Should Stay Flat

Keep these directly in `config/`:

- `sandbox.example.jsonc`
- `sandbox.jsonc`

That keeps the repo friendly for people who want to copy the example and tweak a local override without reading the whole tree first.

## Suggested Migration Order

1. Add the README files first.
2. Move `image/` files.
3. Move `runtime/` files.
4. Move `home/` files.
5. Move `workspace/` files.
6. Move `skills/` files if desired.
7. Update references in:
   - `bin/sandbox`
   - `config/Dockerfile`
   - `README.md`
   - relevant skills and scripts
8. Re-run:
   - `./bin/prek-in-sandbox run --all-files`
   - `node config/skills-catalog.mjs audit "$PWD" "$PWD/config/skills-audit-ignore.txt"`
   - `./bin/sandbox --rebuild bash -ic '<tool checks>'`
   - `./bin/sandbox-measure`

## Recommendation

If this cleanup happens, it should be done as a documentation-first move:

- add the README files first
- then move files into the new structure

That way the organization explains itself as it changes, instead of only making sense after someone reverse-engineers the code.
