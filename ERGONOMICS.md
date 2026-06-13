# Ergonomics

This sandbox is not only about isolation.

It is also meant to give people a usable, low-friction environment while they are working inside the container.

That matters even more in agent-heavy workflows, where too much global tooling state, too many checked-out repos, and too many unrelated local conventions can distort how research or implementation work gets done.

## What This Document Covers

At a high level, this file explains the operator experience inside the sandbox:

- which core command-line tools are available
- what shell and editor ergonomics are included
- what runtime behavior is intentional
- where to look in the repo if you want to change those choices

For the exact wiring, inspect `config/`.

## Command-Line Tools

The sandbox currently includes a small but useful baseline:

- `opencode` for agent work inside the container
- `git`, `gh`, and `lazygit` for version control
- `fd`, `ripgrep`, `jq`, `curl`, and `unzip` for terminal-native investigation
- `fzf` for fuzzy selection and shell history search
- `just` for lightweight command workflows
- `node`, `tsc`, and `go` for common scripting and tool-building tasks
- `prek` for fast local hook execution
- `nvim` and `starship` for interactive editing and shell prompt ergonomics

The package set is defined in `config/nix/tool-groups.nix`.

## Shell Experience

The shell is configured to feel practical rather than bare:

- `v` aliases to `nvim`
- `starship` provides a compact prompt
- `fzf --bash` is enabled, including Ctrl-R history search

Shell ergonomics are split between:

- `config/bashrc`
- `config/shell/`

The intent is to keep the main shell config short while letting isolated quality-of-life features live in their own snippets.

## Editor Experience

Neovim is repo-owned and synced into sandbox home state on startup.

That means:

- editor behavior is reproducible
- plugin metadata can be written into sandbox state
- the repo-owned config itself stays clean and reviewable

Editor config lives under `config/nvim/`.

## Runtime Behavior

The runtime aims for a balance of persistence and safety:

- live workspace state persists by default in a Docker volume
- sandbox home state persists separately in its own Docker volume
- the container root filesystem is read-only by default
- temporary writable paths are provided with tmpfs mounts
- host integrations are mounted read-only unless there is a specific reason not to

These choices are meant to make the environment stable without quietly leaking host-machine state into the active workspace.

## Workspace Versus Home

The sandbox keeps two main persistent areas:

- `/workspace`: project and research artifacts
- `/home/sandbox`: user-level tool state, config, cache, and history

That separation is intentional.

It helps preserve project outputs without conflating them with editor state, agent state, shell history, or global tool data.

## Why This Matters

For this project, ergonomics are part of the product of the template.

The idea is not only to make containerized work possible, but to make it pleasant enough that someone can actually spend long periods of time inside the sandbox without constantly reaching back to host-machine habits.

That is especially important for unbiased research work. A cleaner, more deliberate environment reduces accidental context pollution from the rest of a developer's machine.

## Related Files

- `README.md`: overall project overview
- `FORMATTING.md`: hook and formatting policy
- `config/`: implementation details for image, runtime, shell, editor, and workspace behavior
