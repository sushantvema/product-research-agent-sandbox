#!/usr/bin/env bash
set -euo pipefail

export HOME="${HOME:-/home/sandbox}"
export PATH="/opt/opencode/bin:/nix/var/nix/profiles/default/bin:/usr/local/bin:$PATH"
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
export XDG_STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}"

mkdir -p \
  "$HOME" \
  "$XDG_CONFIG_HOME" \
  "$XDG_CACHE_HOME" \
  "$XDG_DATA_HOME" \
  "$XDG_STATE_HOME"

/usr/local/bin/sync-control-plane.sh

if command -v git >/dev/null 2>&1 && command -v gh >/dev/null 2>&1 && [[ -n "${GH_TOKEN:-}" ]]; then
  git config --global credential.helper '!gh auth git-credential'
fi

cd /workspace

if [[ $# -eq 0 ]]; then
  set -- bash
fi

exec "$@"
