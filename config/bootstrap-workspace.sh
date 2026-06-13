#!/usr/bin/env bash

sandbox_bootstrap_workspace() {
  mkdir -p /workspace

  if [[ "${SANDBOX_BOOTSTRAP_QUARTZ:-0}" != "1" ]]; then
    return
  fi

  if [[ -n "$(ls -A /workspace 2>/dev/null)" ]]; then
    return
  fi

  mkdir -p /workspace/content
  git clone --depth=1 https://github.com/jackyzha0/quartz.git /workspace/quartz

  (
    cd /workspace/quartz
    npm install
    npx quartz create \
      --template "$SANDBOX_QUARTZ_TEMPLATE" \
      --strategy symlink \
      --source ../content \
      --baseUrl "$SANDBOX_QUARTZ_BASE_URL" \
      --links "$SANDBOX_QUARTZ_LINKS"
    npx quartz plugin install --from-config
    rm -rf .git
  )
}

sandbox_bootstrap_workspace
