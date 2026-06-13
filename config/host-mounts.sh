#!/usr/bin/env bash

sandbox_add_file_mount_if_present() {
  local source_path="$1"
  local target_path="$2"

  if [[ -f "$source_path" ]]; then
    EXTRA_MOUNT_ARGS+=( -v "$source_path:$target_path:ro" )
  fi
}

sandbox_add_dir_mount_if_present() {
  local source_path="$1"
  local target_path="$2"

  if [[ -d "$source_path" ]]; then
    EXTRA_MOUNT_ARGS+=( -v "$source_path:$target_path:ro" )
  fi
}
