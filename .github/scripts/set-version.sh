#!/usr/bin/env bash
#
# Writes one version into every file that carries it, so the copies can't drift.
#
# Used twice in the release flow:
#   1. release.yml applies it to the working tree before building, uncommitted.
#   2. publish.yml applies it again and commits, once the draft is approved.
#
# python3 rather than sed: it is present on every GitHub runner including
# Windows, it sidesteps the GNU/BSD `sed -i` incompatibility, and — the reason
# that actually matters — it fails loudly when a pattern stops matching instead
# of quietly leaving a file at the old version and shipping a mislabelled build.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: set-version.sh <x.y.z>" >&2
  exit 1
fi

python3 - "$1" <<'PY'
import re
import sys
from pathlib import Path

version = sys.argv[1]

if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    sys.exit(f"set-version: {version!r} is not a bare x.y.z version")


def replace(path, pattern):
    file = Path(path)
    text = file.read_text()
    new_text, count = re.subn(
        pattern, lambda m: m.group(1) + version + m.group(2), text, count=1
    )
    if count != 1:
        sys.exit(f"set-version: found no version to replace in {path}")
    file.write_text(new_text)
    print(f"  {path}")


# Tolerant of both pretty-printed and minified JSON.
replace("package.json", r'("version"\s*:\s*")[^"]*(")')
replace("src-tauri/tauri.conf.json", r'("version"\s*:\s*")[^"]*(")')

# The first line-anchored `version =`, which is the one under [package].
replace("src-tauri/Cargo.toml", r'(?m)^(version = ")[^"]*(")')

# The crate's own entry, so the lockfile does not go stale against Cargo.toml
# and leave a dirty tree behind after the next build.
replace("src-tauri/Cargo.lock", r'(?m)^(name = "peranti"\nversion = ")[^"]*(")')

print(f"set version to {version}")
PY
