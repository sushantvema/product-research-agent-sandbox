# Agents

## Scope

Work on the sandbox framework, developer experience, and configuration only.

Do not add product notes, research content, or opinionated documentation structure unless explicitly asked.

## Principles

- Keep everything as declarative as practical.
- Prefer small, file-based modules over long monolithic config files.
- Prefer generic, reusable structure over repo-specific hacks.
- Prefer read-only host mounts unless mutation is necessary.
- Prefer explicit runtime hardening defaults unless they block core workflows.
- Prefer repo-owned editor configuration over host-coupled editor configuration.
- Prefer Docker-managed volumes over repo bind mounts for live sandbox state.
- Remove dead files, dead docs, and dead configuration.

## Main Surfaces

- `config/flake.nix`: root Nix composition
- `config/nix/tool-groups.nix`: add or remove tools here
- `config/nix/shell-hook.nix`: shared shell initialization
- `bin/sandbox`: Docker runner and environment wiring
- `config/sandbox.example.jsonc`: declarative launcher defaults template
- `config/host-mounts.sh`: host mount helpers
- `config/bootstrap-workspace.sh`: workspace bootstrap
- `config/runtime-flags.sh`: runtime hardening defaults
- `config/guardrails.sh`: measurement defaults and limits
- `README.md`: human-facing usage
- `AGENTS.md`: agent-facing steering

## Tool Additions

When adding a tool:

1. Put the package in the right category in `config/nix/tool-groups.nix`.
2. Add host integration only if the tool truly needs it.
3. Keep mounts read-only by default.
4. Rebuild the sandbox and verify the tool inside the container.
5. Update `README.md` only if the user-facing workflow changed.

Exception: if a borrowed host config must remain writable at runtime, mount it as a read-only source and sync it into sandbox state instead of mounting it in place.

## Measurement

Track operational drift as the sandbox grows.

- image size
- sandbox home volume size
- startup timing

Preferred command:

```bash
./bin/sandbox-measure
```

## Verification

Prefer verifying through the sandbox itself, for example:

```bash
./bin/sandbox --rebuild <tool> --version
```

For shell-dependent tools, also verify from an interactive shell path.
