{ pkgs, claude-code }:

let
  prek = import ./prek.nix { inherit pkgs; };
in
{
  ai = [
    claude-code.packages.${pkgs.system}.default
  ];

  core = with pkgs; [
    bashInteractive
    curl
    fd
    fzf
    go
    jq
    just
    nodejs_22
    nodePackages.typescript
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
