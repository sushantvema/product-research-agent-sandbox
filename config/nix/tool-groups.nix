{ pkgs, claude-code }:
{
  ai = [
    claude-code.packages.${pkgs.system}.default
  ];

  core = with pkgs; [
    bashInteractive
    curl
    fd
    fzf
    jq
    just
    nodejs_22
    ripgrep
    unzip
  ];

  editors = with pkgs; [
    neovim
    starship
  ];

  vcs = with pkgs; [
    gh
    git
    lazygit
    prek
  ];
}
