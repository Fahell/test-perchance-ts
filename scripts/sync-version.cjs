#!/usr/bin/env node
/**
 * sync-version.cjs - Synchronizes version from constants.ts across the project
 * 
 * Usage: node scripts/sync-version.cjs
 * 
 * Features:
 * - Validates semver format (vMAJOR.MINOR.PATCH)
 * - Scans project for version occurrences with smart patterns
 * - Protects sensitive files (CHANGELOG, package-lock.json)
 * - Only updates project-specific references (not external libraries)
 * - Warns about missing tags and unpushed changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONSTANTS_PATH = path.join(ROOT, 'src', 'constants.ts');
const REPO_NAME = 'test-perchance-ts';

// Files/directories to exclude from scanning
const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.husky',
  '.vscode',
  'coverage'
]);

const EXCLUDED_FILES = new Set([
  "release.sh",
  "test-local.html",
  'CHANGELOG.md',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
]);

// File extensions to scan
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs',
  '.html', '.htm',
  '.css', '.scss', '.less',
  '.md', '.txt',
  '.json', '.yml', '.yaml',
  '.sh', '.bash'
]);

/**
 * Validates semver format: vMAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH
 */
function validateSemver(version) {
  const semverPattern = /^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
  const match = version.match(semverPattern);
  
  if (!match) {
    throw new Error(`Invalid semver format: "${version}". Expected: vMAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH`);
  }
  
  const [, major, minor, patch] = match;
  return {
    valid: true,
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
    normalized: `v${major}.${minor}.${patch}`,
    withoutPrefix: `${major}.${minor}.${patch}`
  };
}

/**
 * Extracts version from constants.ts
 */
function extractVersion() {
  const content = fs.readFileSync(CONSTANTS_PATH, 'utf-8');
  const match = content.match(/export\s+const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Could not extract VERSION from constants.ts');
  }
  return match[1];
}

/**
 * Checks if a file is likely binary (not text)
 */
function isBinaryFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const length = Math.min(buffer.length, 8000);
    
    for (let i = 0; i < length; i++) {
      if (buffer[i] === 0) return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

/**
 * Recursively finds all text files in the project
 */
function findTextFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        findTextFiles(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      // Skip excluded files
      if (EXCLUDED_FILES.has(entry.name)) {
        continue;
      }
      
      const ext = path.extname(entry.name).toLowerCase();
      const hasTextExt = TEXT_EXTENSIONS.has(ext);
      
      if (hasTextExt && !isBinaryFile(fullPath)) {
        fileList.push(fullPath);
      }
    }
  }
  
  return fileList;
}

/**
 * Updates version in package.json (only the "version" field)
 */
function updatePackageJson(filePath, versionWithoutPrefix, stats) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let changesCount = 0;
  const oldVersions = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    // Match "version": "X.Y.Z" pattern (with flexible whitespace)
    const versionMatch = lines[i].match(/^(\s*"version"\s*:\s*")([^"]+)(".*)$/);
    if (versionMatch) {
      const oldVersion = versionMatch[2];
      if (oldVersion !== versionWithoutPrefix) {
        oldVersions.add(oldVersion);
        lines[i] = `${versionMatch[1]}${versionWithoutPrefix}${versionMatch[3]}`;
        changesCount++;
      }
    }
  }
  
  if (changesCount > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    stats.totalChanges += changesCount;
    stats.filesUpdated.push({
      path: path.relative(ROOT, filePath),
      count: changesCount,
      oldVersions: [...oldVersions]
    });
  }
  
  return changesCount;
}

/**
 * Updates version in README.md (only line 1 title)
 */
function updateReadme(filePath, version, stats) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let changesCount = 0;
  const oldVersions = new Set();
  
  // Line 1: Project title "# 🎮 Test Perchance Git (vX.Y.Z)"
  const titlePattern = /^(# .+\()(v?\d+\.\d+\.\d+)(\))$/;
  if (titlePattern.test(lines[0])) {
    const oldLine = lines[0];
    const match = lines[0].match(titlePattern);
    const oldVersion = match[2];
    
    if (oldVersion !== version) {
      oldVersions.add(oldVersion);
      lines[0] = lines[0].replace(titlePattern, `$1${version}$3`);
      changesCount++;
    }
  }
  
  if (changesCount > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    stats.totalChanges += changesCount;
    stats.filesUpdated.push({
      path: path.relative(ROOT, filePath),
      count: changesCount,
      oldVersions: [...oldVersions]
    });
  }
  
  return changesCount;
}

/**
 * Updates version in other files (CDN URLs, comments, etc.)
 * Only updates references to this specific repository
 */
function updateGenericFile(filePath, version, versionWithoutPrefix, stats) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let updatedContent = content;
  let changesCount = 0;
  const oldVersions = new Set();
  
  // Pattern 1: CDN URLs pointing to this repository
  // Example: cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v1.3.0/...
  const repoCdnPattern = new RegExp(
    `(cdn\\.jsdelivr\\.net/gh/[^/]+/${REPO_NAME})@(v?\\d+\\.\\d+\\.\\d+)/`,
    'g'
  );
  
  updatedContent = updatedContent.replace(repoCdnPattern, (match, repoPath, oldVersion) => {
    if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
      oldVersions.add(oldVersion);
      changesCount++;
      return `${repoPath}@${version}/`;
    }
    return match;
  });
  
  // Pattern 2: Comments with version context (only if near repository references)
  // Example: // Version: v1.3.0 or /* v1.3.0 */
  const commentPattern = /(\/\/|\/\*|\*)\s*Version:\s*(v?\d+\.\d+\.\d+)/g;
  updatedContent = updatedContent.replace(commentPattern, (match, commentStart, oldVersion) => {
    if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
      oldVersions.add(oldVersion);
      changesCount++;
      return `${commentStart} Version: ${version}`;
    }
    return match;
  });
  
  // Pattern 3: BASE_URL constant (specific to this project)
  const baseUrlPattern = /BASE_URL\s*=\s*['"][^'"]*@(v?\d+\.\d+\.\d+)/g;
  updatedContent = updatedContent.replace(baseUrlPattern, (match, oldVersion) => {
    if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
      oldVersions.add(oldVersion);
      changesCount++;
      return match.replace(oldVersion, version);
    }
    return match;
  });
  
  // Pattern 4: HTML comments with version
  // Example: <!-- Version: v1.3.0 -->
  const htmlCommentPattern = /(<!--\s*Version:\s*)(v?\d+\.\d+\.\d+)(\s*-->)/g;
  updatedContent = updatedContent.replace(htmlCommentPattern, (match, start, oldVersion, end) => {
    if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
      oldVersions.add(oldVersion);
      changesCount++;
      return `${start}${version}${end}`;
    }
    return match;
  });
  
  // Pattern 5: HTML comments in Portuguese (Versão)
  // Example: <!-- Versão: v1.3.0 -->
  const htmlCommentPtPattern = /(<!--\s*Versão:\s*)(v?\d+\.\d+\.\d+)([^>]*-->)/g;
  updatedContent = updatedContent.replace(htmlCommentPtPattern, (match, start, oldVersion, end) => {
    if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
      oldVersions.add(oldVersion);
      changesCount++;
      return `${start}${version}${end}`;
    }
    return match;
  });
  
  // Pattern 6 & 7: Console logs (FIXED - using complete string matching)
  // Match complete strings containing version keywords, then replace version within
  const stringPattern = /(['"])(.*?)\1/g;
  updatedContent = updatedContent.replace(stringPattern, (match, quote, content) => {
    // Check if string contains version-related keywords
    if (/(bundle|carregando|versão|version|tag\s)/i.test(content)) {
      // Replace version within the string
      const versionPattern = /v?\d+\.\d+\.\d+/g;
      const newContent = content.replace(versionPattern, (oldVersion) => {
        if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
          oldVersions.add(oldVersion);
          changesCount++;
          return version;
        }
        return oldVersion;
      });
      
      if (newContent !== content) {
        return `${quote}${newContent}${quote}`;
      }
    }
    return match;
  });
  
  // Pattern 8: List Panel header
  // Example: // List Panel para Perchance - v1.3.0
  const listPanelPattern = /(\/\/ List Panel para Perchance - )(v?\d+\.\d+\.\d+)/g;
  updatedContent = updatedContent.replace(listPanelPattern, (match, start, oldVersion) => {
    if (oldVersion !== version && oldVersion !== versionWithoutPrefix) {
      oldVersions.add(oldVersion);
      changesCount++;
      return `${start}${version}`;
    }
    return match;
  });
  
  if (changesCount > 0) {
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    stats.totalChanges += changesCount;
    stats.filesUpdated.push({
      path: path.relative(ROOT, filePath),
      count: changesCount,
      oldVersions: [...oldVersions]
    });
  }
  
  return changesCount;
}

/**
 * Checks for unpushed changes and missing tags
 */
function checkGitStatus(version) {
  const warnings = [];
  
  try {
    // Check if tag exists
    try {
      execSync(`git rev-parse ${version}`, { stdio: 'ignore' });
      // Tag exists, check if it's pushed
      try {
        const output = execSync(`git ls-remote --tags origin ${version}`, { encoding: 'utf-8' });
        if (!output.includes(version)) {
          warnings.push(`Tag ${version} exists locally but hasn't been pushed. Run: git push origin ${version}`);
        }
      } catch {
        warnings.push(`Tag ${version} exists locally but hasn't been pushed. Run: git push origin ${version}`);
      }
    } catch {
      warnings.push(`Tag ${version} doesn't exist. Create it with: git tag -a ${version} -m "Release ${version}"`);
      warnings.push(`After creating the tag, push it with: git push origin ${version}`);
    }
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      warnings.push('There are uncommitted changes in the repository. Don\'t forget to commit and push them.');
    }
  } catch {
    // Git commands failed, skip warnings
  }
  
  return warnings;
}

function main() {
  try {
    console.log('🔄 Synchronizing version...\n');
    
    // Extract and validate version
    const rawVersion = extractVersion();
    const validation = validateSemver(rawVersion);
    const version = validation.normalized;
    const versionWithoutPrefix = validation.withoutPrefix;
    
    console.log(`📋 Version detected in constants.ts: ${version}`);
    console.log(`   Semver: ${validation.major}.${validation.minor}.${validation.patch}\n`);
    
    // Find all text files in the project
    const textFiles = findTextFiles(ROOT);
    console.log(`📂 Scanning ${textFiles.length} text files...\n`);
    
    // Update files
    const stats = {
      totalChanges: 0,
      filesUpdated: []
    };
    
    for (const filePath of textFiles) {
      // Skip constants.ts (source of truth)
      if (filePath === CONSTANTS_PATH) continue;
      
      const fileName = path.basename(filePath);
      
      // Special handling for package.json
      if (fileName === 'package.json') {
        updatePackageJson(filePath, versionWithoutPrefix, stats);
        continue;
      }
      
      // Special handling for README.md
      if (fileName === 'README.md') {
        updateReadme(filePath, version, stats);
        continue;
      }
      
      // Generic handling for other files
      updateGenericFile(filePath, version, versionWithoutPrefix, stats);
    }
    
    // Print results
    console.log('='.repeat(60));
    
    if (stats.totalChanges === 0) {
      console.log('✅ All files are already synchronized.');
    } else {
      console.log(`✅ ${stats.totalChanges} change(s) applied:\n`);
      
      for (const file of stats.filesUpdated) {
        const oldVersionsStr = file.oldVersions.join(', ');
        console.log(`   📄 ${file.path}`);
        console.log(`      ${file.count} occurrence(s): ${oldVersionsStr} → ${version}`);
      }
    }
    
    // Check git status and show warnings
    console.log('\n' + '='.repeat(60));
    console.log('📌 Git Status Check:\n');
    
    const warnings = checkGitStatus(version);
    
    if (warnings.length === 0) {
      console.log('   ✅ Repository is up to date.');
    } else {
      for (const warning of warnings) {
        console.log(`   ⚠️  ${warning}`);
      }
    }
    
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
