#!/usr/bin/env bash

SANDBOX_DISABLE_HARDENING="${SANDBOX_DISABLE_HARDENING:-0}"
SANDBOX_PID_LIMIT="${SANDBOX_PID_LIMIT:-512}"
SANDBOX_READ_ONLY_ROOT="${SANDBOX_READ_ONLY_ROOT:-1}"

sandbox_collect_runtime_args() {
  RUNTIME_ARGS=()

  if [[ "$SANDBOX_DISABLE_HARDENING" == "1" ]]; then
    return
  fi

  RUNTIME_ARGS+=(
    --cap-drop ALL
    --security-opt no-new-privileges
    --pids-limit "$SANDBOX_PID_LIMIT"
  )

  if [[ "$SANDBOX_READ_ONLY_ROOT" == "1" ]]; then
    RUNTIME_ARGS+=(
      --read-only
      --tmpfs /tmp:rw,exec,nosuid,nodev,size=512m
      --tmpfs /var/tmp:rw,exec,nosuid,nodev,size=512m
      --tmpfs /run:rw,nosuid,nodev,size=64m
    )
  fi
}
