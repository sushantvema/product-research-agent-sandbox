#!/usr/bin/env bash
set -euo pipefail

export HOME="${HOME:-/home/sandbox}"
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
export XDG_STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}"

SANDBOX_CONFIG_HOME="${SANDBOX_CONFIG_HOME:-$XDG_CONFIG_HOME/sandbox}"

ensure_line() {
  local file="$1"
  local line="$2"

  mkdir -p "$(dirname "$file")"
  touch "$file"

  if ! grep -Fqx "$line" "$file"; then
    printf '%s\n' "$line" >> "$file"
  fi
}

sync_file_from_source() {
  local source_path="$1"
  local target_path="$2"

  if [[ ! -f "$source_path" ]]; then
    return
  fi

  mkdir -p "$(dirname "$target_path")"
  cp "$source_path" "$target_path"
}

sync_dir_from_source() {
  local source_path="$1"
  local target_path="$2"

  if [[ ! -d "$source_path" ]]; then
    return
  fi

  rm -rf "$target_path"
  mkdir -p "$target_path"
  cp -R "$source_path/." "$target_path"
}

sandbox_sync_home_control_plane() {
  mkdir -p \
    "$HOME" \
    "$XDG_CONFIG_HOME" \
    "$XDG_CACHE_HOME" \
    "$XDG_DATA_HOME" \
    "$XDG_STATE_HOME" \
    "$SANDBOX_CONFIG_HOME"

  sync_dir_from_source /etc/sandbox/nvim-source "$XDG_CONFIG_HOME/nvim"
  sync_file_from_source /etc/sandbox/bashrc "$SANDBOX_CONFIG_HOME/bashrc"
  sync_file_from_source /etc/sandbox/starship.toml "$SANDBOX_CONFIG_HOME/starship.toml"

  ensure_line "$HOME/.bashrc" 'source ~/.config/sandbox/bashrc'
  ensure_line "$HOME/.bash_profile" 'if [ -f ~/.bashrc ]; then . ~/.bashrc; fi'

  if [[ -f "$HOME/.gitconfig-host" ]] && { [[ ! -f "$HOME/.gitconfig" ]] || ! grep -Fq '.gitconfig-host' "$HOME/.gitconfig"; }; then
    printf '%s\n' '[include]' '  path = ~/.gitconfig-host' >> "$HOME/.gitconfig"
  fi
}

sandbox_sync_workspace_seed() {
  local seed_root="/etc/sandbox/workspace-seed"

  mkdir -p /workspace

  if [[ ! -d "$seed_root" ]]; then
    return
  fi

  # Seed files should never overwrite live workspace edits.
  while IFS= read -r -d '' source_path; do
    local relative_path target_path

    relative_path="${source_path#${seed_root}/}"
    target_path="/workspace/$relative_path"

    if [[ -e "$target_path" ]]; then
      continue
    fi

    mkdir -p "$(dirname "$target_path")"
    cp "$source_path" "$target_path"
  done < <(find "$seed_root" -type f -print0)
}

sandbox_sync_control_plane() {
  sandbox_sync_home_control_plane
  sandbox_sync_workspace_seed
}

sandbox_sync_control_plane
