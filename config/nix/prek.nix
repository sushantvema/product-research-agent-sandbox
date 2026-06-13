{ pkgs }:

let
  version = "0.4.4";
  asset =
    if pkgs.system == "x86_64-linux" then
      {
        name = "prek-x86_64-unknown-linux-musl.tar.gz";
        sha256 = "sha256-4qCqY8ZGjrzUc07n12PowSI7+5vavLRSinr6xrAUfhI=";
      }
    else if pkgs.system == "aarch64-linux" then
      {
        name = "prek-aarch64-unknown-linux-musl.tar.gz";
        sha256 = "sha256-s46heOP3Onp2ft3kegkfqsKBTZO6f6pZDLqNGdD9x2o=";
      }
    else
      throw "Unsupported system for prek: ${pkgs.system}";
in
pkgs.stdenvNoCC.mkDerivation {
  pname = "prek";
  inherit version;

  src = pkgs.fetchurl {
    url = "https://github.com/j178/prek/releases/download/v${version}/${asset.name}";
    inherit (asset) sha256;
  };

  nativeBuildInputs = with pkgs; [ gnutar gzip ];

  phases = [ "installPhase" ];

  installPhase = ''
    mkdir -p "$out/bin"
    tar -xzf "$src"
    install -m755 ./*/prek "$out/bin/prek"
  '';

  meta = with pkgs.lib; {
    description = "Fast Rust-based drop-in alternative to pre-commit";
    homepage = "https://github.com/j178/prek";
    license = licenses.mit;
    platforms = [ "x86_64-linux" "aarch64-linux" ];
    sourceProvenance = with sourceTypes; [ binaryNativeCode ];
    mainProgram = "prek";
  };
}
