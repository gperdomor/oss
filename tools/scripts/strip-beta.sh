#!/usr/bin/env bash

# Replaces "-beta.5" with "-beta.888" in the version field in all package.json files under packages/
SHORT_SHA="${GITHUB_SHA:0:7}"
find packages -name "package.json" | while read -r file; do
  sed -i '' 's/\("version": ".*\)-beta\.5"/\1-nightly.'"${SHORT_SHA}"'"/' "$file"
done
