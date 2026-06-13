FROM debian:bookworm-slim

ARG OPENCODE_VERSION=1.17.4
ARG TARGETARCH

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/root/.nix-profile/bin:/nix/var/nix/profiles/default/bin:${PATH}"
ENV NIX_CONFIG="experimental-features = nix-command flakes"
WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    xz-utils \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system nixbld \
  && for n in $(seq 1 10); do useradd --system --gid nixbld --groups nixbld --home-dir /var/empty --shell /usr/sbin/nologin "nixbld$n"; done \
  && mkdir -m 0755 /nix \
  && curl -fsSL https://nixos.org/nix/install -o /tmp/install-nix.sh \
  && sh /tmp/install-nix.sh --no-daemon \
  && rm -f /tmp/install-nix.sh

COPY config/flake.nix /tmp/bootstrap/flake.nix
COPY config/nix /tmp/bootstrap/nix
COPY config/bashrc /etc/sandbox/bashrc
COPY config/bootstrap-workspace.sh /usr/local/bin/bootstrap-workspace.sh
COPY config/shell /etc/sandbox/shell
COPY config/sync-control-plane.sh /usr/local/bin/sync-control-plane.sh
COPY config/nvim /etc/sandbox/nvim-source
COPY config/workspace-seed /etc/sandbox/workspace-seed
COPY config/starship.toml /etc/sandbox/starship.toml

RUN nix profile install --profile /nix/var/nix/profiles/default /tmp/bootstrap#tooling

RUN case "${TARGETARCH:-amd64}" in \
      amd64) asset='opencode-linux-x64-baseline.tar.gz' ;; \
      arm64) asset='opencode-linux-arm64.tar.gz' ;; \
      *) echo "unsupported arch: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
  && curl -fsSL -o /tmp/opencode.tar.gz "https://github.com/anomalyco/opencode/releases/download/v${OPENCODE_VERSION}/${asset}" \
  && tar -xzf /tmp/opencode.tar.gz -C /tmp \
  && mkdir -p /opt/opencode/bin \
  && mv /tmp/opencode /opt/opencode/bin/opencode \
  && chmod 0755 /opt/opencode/bin/opencode \
  && rm -f /tmp/opencode.tar.gz \
  && /opt/opencode/bin/opencode --version

RUN printf '%s\n' 'export PATH=/opt/opencode/bin:/nix/var/nix/profiles/default/bin:$PATH' > /etc/profile.d/sandbox-path.sh

RUN printf '%s\n' 'export STARSHIP_CONFIG=/etc/sandbox/starship.toml' > /etc/profile.d/sandbox-starship.sh

COPY bin/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/bootstrap-workspace.sh /usr/local/bin/sync-control-plane.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]
