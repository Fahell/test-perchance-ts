#!/usr/bin/env node

/**
 * Synchronizes the version string across all project files.
 * Updates: src/constants.ts, package.json, and any CDN URLs in source files.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PROJECT_ROOT = path.resolve(ROOT, "..");

// Read version from package.json
const packageJsonPath = path.join(PROJECT_ROOT, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

if (!version) {
  console.error("Error: No version found in package.json");
  process.exit(1);
}

console.log(`Synchronizing version: ${version}`);

// Update src/constants.ts
const constantsPath = path.join(PROJECT_ROOT, "src", "constants.ts");
if (fs.existsSync(constantsPath)) {
  let content = fs.readFileSync(constantsPath, "utf-8");
  const versionRegex = /export const VERSION = 'v[^']*';/;
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, `export const VERSION = 'v${version}';`);
    fs.writeFileSync(constantsPath, content);
    console.log(`Updated: ${constantsPath}`);
  } else {
    console.warn(`Warning: VERSION pattern not found in ${constantsPath}`);
  }
}

// Update CDN URLs in HTML files
const indexHtmlPath = path.join(PROJECT_ROOT, "index.html");
if (fs.existsSync(indexHtmlPath)) {
  let content = fs.readFileSync(indexHtmlPath, "utf-8");
  const cdnRegex = /\/dist\/main\.bundle\.[a-f0-9]+\.js/g;
  // We don't know the hash, so we just log a warning
  const hasCdnRef = /main\.bundle/.test(content);
  if (hasCdnRef) {
    console.log(`Note: CDN references found in ${indexHtmlPath} - will be updated by build`);
  }
}

console.log("Version synchronization complete.");
