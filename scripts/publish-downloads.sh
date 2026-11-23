#!/bin/sh
# Builds, verifies and publishes the downloadable zips as a GitHub release. Owner only: run it when the owner says go.
#   sh scripts/publish-downloads.sh v1.0.0-beta.3        (creates the release, or updates the files of an existing one)
#   sh scripts/publish-downloads.sh v1.0.0-beta.3 --check   (build and verify only, publish nothing)
#
# IMPORTANT: the README links use https://github.com/vfreyai/skills/releases/latest/download/<file>.zip. GitHub's "latest" ignores
# pre-releases, so the release must be a NORMAL release marked --latest, even though the version is 1.0.0-beta.x. Never pass --prerelease.
set -eu
cd "$(dirname "$0")/.."
tag="${1:?usage: publish-downloads.sh <tag, for example v1.0.0-beta.3> [--check]}"
check_only="${2:-}"

node scripts/build-downloads.mjs
cd dist/downloads

echo "Verifying..."
for z in *.zip; do
  unzip -tq "$z" >/dev/null || { echo "bad zip: $z"; exit 1; }
  [ "$(wc -c <"$z")" -gt 1000 ] || { echo "suspiciously small: $z"; exit 1; }
  # every folder in the zip is a skill whose SKILL.md name equals the folder name
  for dir in $(unzip -Z1 "$z" | cut -d/ -f1 | sort -u); do
    name=$(unzip -p "$z" "$dir/SKILL.md" | sed -n 's/^name: *//p' | head -1 | tr -d '"')
    [ "$name" = "$dir" ] || { echo "$z: folder $dir has SKILL.md name '$name'"; exit 1; }
  done
done
shasum -a 256 -c SHA256SUMS.txt >/dev/null || { echo "SHA256SUMS.txt does not match"; exit 1; }
ls -l *.zip | awk '{print $5, $9}'
echo "All zips verified."
cd ../..
[ "$check_only" = "--check" ] && exit 0

version="${tag#v}"
styles=$(ls -d skills/vfrey-style-* | wc -l | tr -d " ")
sed -e "s/{{VERSION}}/$version/g" -e "s/{{STYLES}}/$styles/g" .github/RELEASE_TEMPLATE.md >dist/release-notes.md
if gh release view "$tag" -R vfreyai/skills >/dev/null 2>&1; then
  gh release upload "$tag" dist/downloads/* --clobber -R vfreyai/skills
else
  gh release create "$tag" dist/downloads/* --latest --title "vfrey skills $version" --notes-file dist/release-notes.md -R vfreyai/skills
fi
