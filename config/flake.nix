{
  description = "Sandbox shell for AI cost optimization exploration";

  inputs = {
    claude-code.url = "github:sadjow/claude-code-nix?ref=v2.1.177";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };

  outputs = { self, nixpkgs, claude-code }:
    let
      lib = nixpkgs.lib;
      systems = [ "x86_64-linux" "aarch64-linux" ];
      shellHook = import ./nix/shell-hook.nix;
      toolGroupsFor = pkgs: import ./nix/tool-groups.nix {
        inherit pkgs claude-code;
      };
      toolPackagesFor = pkgs: lib.flatten (lib.attrValues (toolGroupsFor pkgs));
      forAllSystems = f:
        lib.genAttrs systems (system:
          f (import nixpkgs { inherit system; }));
    in {
      packages = forAllSystems (pkgs: {
        toolGroups = toolGroupsFor pkgs;

        tooling = pkgs.buildEnv {
          name = "sandbox-tooling";
          paths = toolPackagesFor pkgs;
        };

        default = self.packages.${pkgs.system}.tooling;
      });

      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = toolPackagesFor pkgs;

          inherit shellHook;
        };
      });
    };
}
