#!/bin/sh
# Fails if the middle dot character (U+00B7) appears in any text file of this repo.
cd "$(dirname "$0")/.." || exit 1
dot=$(printf '\302\267')
hits=$(grep -rIn --exclude-dir=.git --exclude-dir=node_modules -e "$dot" . )
if [ -n "$hits" ]; then
  echo "Middle dot found (never use it as a separator):"
  echo "$hits"
  exit 1
fi
echo "no middle dot: ok"
