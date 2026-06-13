# Formatting And Hook Conventions

This repo uses `prek` as its Git hook runner.

The goal is to enforce a small number of high-signal checks early, without turning the sandbox template into a style-heavy or formatter-heavy project.

## Why `prek`

- It is a fast Rust-based drop-in alternative to `pre-commit`.
- It supports the standard pre-commit-style config format used here.
- Its built-in hooks avoid Python environment setup for common hygiene checks.

## Hook Policy

The hook set is intentionally conservative.

Included now:

- whitespace cleanup
- end-of-file normalization
- LF line ending normalization
- YAML, TOML, and JSONC or JSON5 syntax validation
- merge-conflict marker detection
- private-key detection
- shebang and executable-bit consistency
- shell syntax validation
- Node `.mjs` syntax validation

Deferred for now:

- opinionated code formatters
- large lint suites with many style rules
- language-specific analyzers that would require more toolchain setup and project policy

The idea is to catch broken or noisy files early without introducing churn across docs, scripts, and config.

## Chosen Settings

### `trailing-whitespace --markdown-linebreak-ext=md`

Markdown sometimes uses two trailing spaces as a meaningful hard line break.

This setting preserves that behavior for `.md` files while still cleaning accidental trailing whitespace everywhere else.

### `mixed-line-ending --fix=lf`

The sandbox template is meant to be edited across different host environments, but committed text files should stay deterministic.

Normalizing to LF reduces noisy diffs and avoids accidental CRLF churn from host editor settings.

### `check-json5` on `*.jsonc` and `*.json5`

This repo uses commented JSON configuration files such as `config/sandbox.example.jsonc`.

Using JSON5 validation is the simplest way to check those files without forcing a separate parser or changing the file format.

### `bash -n` for shell scripts

For now the project enforces parser correctness, not shell style.

The hook uses `bin/hooks/bash-syntax-check`, which simply runs `bash -n` across every matched file. The wrapper exists because pre-commit-style runners can pass multiple filenames to one hook invocation.

This catches broken shell syntax with almost no setup cost and avoids prematurely locking the repo into a heavier shell lint policy.

### `node --check` for `.mjs`

The repo includes small Node helpers for config and audit flows.

The hook uses `bin/hooks/node-syntax-check`, which runs `node --check` on each matched file. The wrapper keeps the hook correct when multiple `.mjs` files are passed in one invocation.

This catches syntax errors early without introducing a broader JavaScript formatter or linter policy.

## Installing Hooks

This repo can run hooks in two ways:

1. Preferred here: install the sandbox-backed hook shim, which does not require a native host `prek` binary.
2. Optional: run `prek install` directly if `prek` is already installed on the host.

Install the sandbox-backed hook shim with:

```bash
./bin/install-hooks
```

If you already have native `prek` on the host, this also works:

```bash
prek install
```

Run all hooks on demand with:

```bash
prek run --all-files
```

The sandbox-backed hook uses `bin/prek-in-sandbox`, which bind-mounts this repo as the sandbox workspace and runs `prek` inside the sandbox image.
