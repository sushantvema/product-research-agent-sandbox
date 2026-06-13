#!/usr/bin/env bash

# Enable fzf's bash integration, including Ctrl-R history search, when the
# binary is present in the sandbox toolchain.
if command -v fzf >/dev/null 2>&1; then
  eval "$(fzf --bash)"
fi
