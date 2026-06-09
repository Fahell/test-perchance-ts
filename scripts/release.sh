#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?Usage: $0 <semver-tag e.g. v1.0.0>}"

# Validate semver format
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Invalid version format: $VERSION (expected vX.Y.Z)"
  exit 1
fi

echo "🚀 Releasing $VERSION..."

# Step 1: Lint
echo "📝 Running lint..."
npm run lint || { echo "❌ Lint failed"; exit 1; }

# Step 2: Tests
echo "🧪 Running tests..."
npm test || { echo "❌ Tests failed"; exit 1; }

# Step 3: Build
echo "🏗️  Building..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Step 4: Update version in constants.ts
sed -i "s/export const VERSION = '.*'/export const VERSION = '$VERSION'/" src/constants.ts
sed -i "s|@v[0-9]*\.[0-9]*\.[0-9]*|@$VERSION|" src/constants.ts

# Step 5: Update for-perchance.html with new version
sed -i "s|@v[0-9]*\.[0-9]*\.[0-9]*|@$VERSION|" for-perchance.html
sed -i "s|version [0-9]*\.[0-9]*\.[0-9]*|version $VERSION|" for-perchance.html

# Step 6: Commit and tag
git add -A
git commit -m "chore: release $VERSION" || echo "⚠️  Nothing to commit"
git tag -f "$VERSION"
git push origin main --tags

echo "✅ Release $VERSION complete!"
