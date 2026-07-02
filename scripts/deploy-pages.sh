#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

cd dist
git init -q
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
git add -A
git commit -m "deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)" -q
git push -f "https://github.com/SahniNitish/trifecta.git" gh-pages

echo "Deployed to https://sahninitish.github.io/trifecta/"