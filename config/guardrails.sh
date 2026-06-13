#!/usr/bin/env bash

SANDBOX_MAX_IMAGE_SIZE_MB="${SANDBOX_MAX_IMAGE_SIZE_MB:-4096}"
SANDBOX_MAX_HOME_SIZE_MB="${SANDBOX_MAX_HOME_SIZE_MB:-2048}"

sandbox_check_limit() {
  local label="$1"
  local actual_mb="$2"
  local limit_mb="$3"

  if (( actual_mb > limit_mb )); then
    printf '%s: %s MB exceeds limit of %s MB\n' "$label" "$actual_mb" "$limit_mb" >&2
    return 1
  fi

  printf '%s: %s MB (limit %s MB)\n' "$label" "$actual_mb" "$limit_mb"
}
