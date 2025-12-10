# Docker Image Versioning Strategy for Jenkins Pipeline

## Overview

This document describes a comprehensive versioning strategy for building Quarkus base Docker images in Jenkins with robust version determination, proper fallback mechanisms, and semantic versioning support.

## Table of Contents

1. [Version Determination Strategy](#version-determination-strategy)
2. [Semantic Versioning Format](#semantic-versioning-format)
3. [Tag Naming Convention](#tag-naming-convention)
4. [Implementation Guide](#implementation-guide)
5. [Developer Workflow](#developer-workflow)
6. [Testing Strategy](#testing-strategy)
7. [Troubleshooting](#troubleshooting)

---

## Version Determination Strategy

### Four-Tier Strategy

The versioning system uses a four-tier fallback strategy to ensure builds never fail due to version determination issues:

#### 1. Exact Tag (Release Builds)
**When**: Current commit has an exact matching tag
```bash
git tag --points-at HEAD | grep '^quarkus-base-v'
```

**Result**: `quarkus-base-v1.2.3` → Version: `1.2.3`

**Docker Tags**: `1.2.3`, `latest`

**Use Case**: Official releases built from tagged commits

#### 2. Latest Tag + Increment (Development Builds)
**When**: No exact tag on current commit, but tags exist in repository
```bash
git tag -l 'quarkus-base-v*' | sort -V | tail -1
```

**Result**: Latest tag `quarkus-base-v1.2.3` → Version: `1.2.4-dev.42.abc12345`

**Format**: `{next-version}-dev.{build-number}.{commit-hash}`

**Docker Tags**: `1.2.4-dev.42.abc12345`, `{branch}-latest`

**Use Case**: Development builds on feature branches or main between releases

#### 3. Initial Version (No Tags Exist)
**When**: No tags exist in repository yet
```bash
git tag -l 'quarkus-base-v*' returns empty
```

**Result**: Version: `0.1.0-dev.1.abc12345`

**Docker Tags**: `0.1.0-dev.1.abc12345`, `{branch}-latest`

**Use Case**: First build of a new project or after repository initialization

#### 4. Complete Fallback (Error Recovery)
**When**: All other methods fail (git issues, permissions, etc.)

**Result**: Version: `0.0.0-20250104-143022.1.unknown`

**Format**: `0.0.0-{timestamp}.{build-number}.{commit-hash|unknown}`

**Docker Tags**: `0.0.0-20250104-143022.1.unknown`

**Use Case**: Emergency fallback to prevent build failures

---

## Semantic Versioning Format

### Release Versions
```
MAJOR.MINOR.PATCH
```

**Examples**:
- `1.0.0` - Initial release
- `1.2.3` - Standard release
- `2.0.0` - Major version with breaking changes

### Development Versions
```
MAJOR.MINOR.PATCH-dev.BUILD.COMMIT
```

**Examples**:
- `1.2.4-dev.42.abc12345` - Development build 42, based on commit abc12345
- `2.0.0-dev.1.def67890` - First development build of upcoming 2.0.0

### Version Increment Rules

| Change Type | Version Increment | Example |
|-------------|------------------|---------|
| Breaking changes | MAJOR | 1.2.3 → 2.0.0 |
| New features (backwards compatible) | MINOR | 1.2.3 → 1.3.0 |
| Bug fixes, patches | PATCH | 1.2.3 → 1.2.4 |

---

## Tag Naming Convention

### Format
```
{prefix}{semantic-version}
```

### Examples
```bash
quarkus-base-v1.0.0
quarkus-base-v1.2.3
quarkus-base-v2.0.0
```

### Tag Rules

1. **Prefix**: `quarkus-base-v` (configurable in pipeline)
2. **Version**: Must be valid semantic version (X.Y.Z where X, Y, Z are integers)
3. **No pre-release identifiers**: Tags should be release versions only
4. **Annotated tags**: Always use `-a` flag for proper git metadata

### Invalid Tag Names
```bash
# ❌ Wrong - missing prefix
1.2.3

# ❌ Wrong - invalid format
quarkus-base-1.2.3

# ❌ Wrong - pre-release in tag (use dev versions instead)
quarkus-base-v1.2.3-beta

# ❌ Wrong - extra characters
quarkus-base-v1.2.3-final
```

---

## Implementation Guide

### Step 1: Add Versioning Library to Repository

Place `jenkins-version-strategy.groovy` in your repository:

```
claninfo-shared-lib/
├── jenkins/
│   └── version-strategy.groovy
├── Dockerfile
└── Jenkinsfile
```

### Step 2: Configure Jenkinsfile

```groovy
@Library('shared-pipeline-library') _

def versionLib = load 'jenkins/version-strategy.groovy'

pipeline {
    agent any

    environment {
        TAG_PREFIX = 'quarkus-base-v'
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    // Determine version
                    def versionInfo = versionLib.determineImageVersion(
                        env.TAG_PREFIX,
                        env.BRANCH_NAME,
                        env.BUILD_NUMBER
                    )

                    // Print and set environment
                    versionLib.printVersionInfo(versionInfo)
                    env.IMAGE_VERSION = versionInfo.version
                    env.DOCKER_TAGS = versionInfo.dockerTags.join(',')
                }
            }
        }

        // ... rest of pipeline stages
    }
}
```

### Step 3: Configure Jenkins Credentials

1. **Docker Registry Credentials**:
   - ID: `docker-registry-credentials`
   - Type: Username with password
   - Scope: Global

2. **Git Credentials** (for pushing tags):
   - ID: `git-credentials`
   - Type: Username with password
   - Scope: Global

---

## Developer Workflow

### Creating a Release

#### Option 1: Manual Tag + Jenkins Build

1. **Ensure main branch is ready for release**:
```bash
git checkout main
git pull origin main
```

2. **Create and push release tag**:
```bash
# For patch release (1.2.3 → 1.2.4)
git tag -a quarkus-base-v1.2.4 -m "Release 1.2.4 - Bug fixes and improvements"
git push origin quarkus-base-v1.2.4

# For minor release (1.2.4 → 1.3.0)
git tag -a quarkus-base-v1.3.0 -m "Release 1.3.0 - New features"
git push origin quarkus-base-v1.3.0

# For major release (1.3.0 → 2.0.0)
git tag -a quarkus-base-v2.0.0 -m "Release 2.0.0 - Breaking changes"
git push origin quarkus-base-v2.0.0
```

3. **Trigger Jenkins build**:
   - Jenkins will detect the tag and build release version
   - Images will be tagged with version + `latest`

#### Option 2: Jenkins Parameterized Build

1. **Trigger Jenkins build with parameters**:
   - `CREATE_RELEASE`: ✅ Check
   - `RELEASE_VERSION`: e.g., `1.2.4`
   - `VERSION_INCREMENT`: Select `patch`, `minor`, or `major`

2. **Jenkins will**:
   - Build the image with specified version
   - Create and push the git tag automatically
   - Tag Docker images appropriately

### Development Builds

Development builds happen automatically:

```bash
# Work on feature branch
git checkout -b feature/new-optimization
# ... make changes ...
git commit -m "Optimize Quarkus startup"
git push origin feature/new-optimization
```

**Jenkins will**:
- Detect no exact tag on commit
- Find latest release tag (e.g., `quarkus-base-v1.2.3`)
- Generate version: `1.2.4-dev.42.abc12345`
- Tag images: `1.2.4-dev.42.abc12345`, `feature-new-optimization-latest`

### Viewing Available Versions

```bash
# List all release tags
git tag -l 'quarkus-base-v*' | sort -V

# Get latest release version
git tag -l 'quarkus-base-v*' | sort -V | tail -1

# Get version of current commit
git describe --tags --match 'quarkus-base-v*' --abbrev=0
```

---

## Testing Strategy

### Local Testing (Before Jenkins)

#### Test 1: Version Determination with Tags

```bash
# Create test repository
mkdir test-versioning && cd test-versioning
git init

# Create initial commit
echo "FROM eclipse-temurin:17-jre" > Dockerfile
git add Dockerfile
git commit -m "Initial commit"

# Test: No tags exist (should return 0.1.0-dev.X.X)
git tag -l 'quarkus-base-v*'
# Expected: empty

# Create first tag
git tag -a quarkus-base-v1.0.0 -m "First release"

# Test: Exact tag (should return 1.0.0)
git tag --points-at HEAD
# Expected: quarkus-base-v1.0.0

# Make new commit
echo "# Updated" >> Dockerfile
git add Dockerfile
git commit -m "Update"

# Test: Latest tag + increment (should return 1.0.1-dev.X.X)
git tag -l 'quarkus-base-v*' | sort -V | tail -1
# Expected: quarkus-base-v1.0.0
```

#### Test 2: Version Extraction

```groovy
// Test in groovy console
def version = "quarkus-base-v1.2.3"
def extracted = version.replaceFirst("^quarkus-base-v", "")
println extracted  // Should print: 1.2.3

// Test validation
def valid = extracted =~ /^\d+\.\d+\.\d+$/
println valid  // Should print: true
```

#### Test 3: Version Increment

```groovy
def version = "1.2.3"
def parts = version.tokenize('.')

// Test patch increment
def patch = parts[2].toInteger() + 1
println "${parts[0]}.${parts[1]}.${patch}"  // Should print: 1.2.4

// Test minor increment
def minor = parts[1].toInteger() + 1
println "${parts[0]}.${minor}.0"  // Should print: 1.3.0

// Test major increment
def major = parts[0].toInteger() + 1
println "${major}.0.0"  // Should print: 2.0.0
```

### Jenkins Testing

#### Test 1: Development Build

1. **Create feature branch without tag**:
```bash
git checkout -b test/version-dev
git push origin test/version-dev
```

2. **Trigger Jenkins build**

3. **Verify**:
   - Check build logs for version determination
   - Verify version format: `X.Y.Z-dev.BUILD.COMMIT`
   - Check Docker registry for tagged images

#### Test 2: Release Build (Manual Tag)

1. **Create release tag**:
```bash
git checkout main
git tag -a quarkus-base-v1.2.3 -m "Test release"
git push origin quarkus-base-v1.2.3
```

2. **Trigger Jenkins build**

3. **Verify**:
   - Check build logs for exact tag detection
   - Verify version: `1.2.3`
   - Check Docker registry for `1.2.3` and `latest` tags

#### Test 3: Release Build (Parameterized)

1. **Trigger Jenkins with parameters**:
   - `CREATE_RELEASE`: ✅
   - `RELEASE_VERSION`: `1.2.4`

2. **Verify**:
   - Check build logs for version override
   - Verify git tag was created: `quarkus-base-v1.2.4`
   - Check Docker registry for images

#### Test 4: Fallback Behavior

1. **Simulate git failure** (in Jenkinsfile test):
```groovy
// Temporarily break git commands
sh 'git config core.filemode false'
sh 'chmod 000 .git/config'  // Break git access
```

2. **Trigger build**

3. **Verify**:
   - Build should NOT fail
   - Version should use timestamp fallback
   - Check logs for fallback warning

---

## Troubleshooting

### Issue 1: "No tag found" on release build

**Symptom**: Build expected to be release version but gets dev version

**Diagnosis**:
```bash
# Check if tag exists
git tag -l 'quarkus-base-v*'

# Check if tag points to current commit
git tag --points-at HEAD

# Check tag pattern
git tag -l 'quarkus-base-v*' | grep -E '^quarkus-base-v[0-9]+\.[0-9]+\.[0-9]+$'
```

**Solutions**:
1. Ensure tag matches exact pattern: `quarkus-base-vX.Y.Z`
2. Verify tag is pushed: `git push origin <tag-name>`
3. Check Jenkins fetched tags: Add `git fetch --tags` in Initialize stage

### Issue 2: "Invalid semantic version" error

**Symptom**: Build fails with version format error

**Diagnosis**:
```bash
# Check tag format
git tag -l 'quarkus-base-v*'

# Verify pattern
echo "quarkus-base-v1.2.3" | grep -E '^quarkus-base-v[0-9]+\.[0-9]+\.[0-9]+$'
```

**Solutions**:
1. Tags must be exactly `prefix + X.Y.Z` (no extra characters)
2. Remove invalid tags: `git tag -d <tag-name> && git push origin :refs/tags/<tag-name>`
3. Recreate with correct format

### Issue 3: Permission denied pushing tags

**Symptom**: Jenkins fails at "Create Release Tag" stage

**Diagnosis**:
```groovy
// Check credentials in Jenkins
withCredentials([usernamePassword(credentialsId: 'git-credentials')]) {
    sh 'git config --list | grep credential'
}
```

**Solutions**:
1. Verify `git-credentials` exists in Jenkins
2. Check credential has push permissions
3. Test credential: `git push --dry-run origin main`
4. For SSH: Ensure SSH key is added to Jenkins

### Issue 4: Docker tag limit exceeded

**Symptom**: Too many Docker tags being created

**Diagnosis**:
```bash
# Check DOCKER_TAGS environment variable
echo $DOCKER_TAGS | tr ',' '\n'
```

**Solutions**:
1. Limit tags in development builds to version + branch-latest
2. Don't tag every build with `latest` (reserve for releases)
3. Implement tag cleanup policy in Docker registry

### Issue 5: Version doesn't increment correctly

**Symptom**: Development version not incrementing from latest tag

**Diagnosis**:
```bash
# Check latest tag
git tag -l 'quarkus-base-v*' | sort -V | tail -1

# Verify sort order
git tag -l 'quarkus-base-v*' | sort -V
```

**Solutions**:
1. Ensure `sort -V` is available (version sort)
2. If not available, use alternative: `sort -t. -k1,1n -k2,2n -k3,3n`
3. Check tag pattern matches exactly

### Issue 6: Build number not incrementing

**Symptom**: Same build number in multiple builds

**Diagnosis**:
```groovy
println "BUILD_NUMBER: ${env.BUILD_NUMBER}"
println "BUILD_ID: ${env.BUILD_ID}"
```

**Solutions**:
1. Verify Jenkins environment variables are set
2. Check if build counter was reset
3. Use `BUILD_ID` as alternative if needed

---

## Best Practices

### 1. Tag Hygiene

- ✅ Create annotated tags: `git tag -a` (includes metadata)
- ✅ Write meaningful tag messages
- ✅ Tag only on main/master branch for releases
- ❌ Don't create tags on feature branches
- ❌ Don't delete and recreate tags (breaks history)

### 2. Version Increment Guidelines

- **Patch (0.0.X)**: Bug fixes, security patches, documentation
- **Minor (0.X.0)**: New features, backwards compatible
- **Major (X.0.0)**: Breaking changes, major refactors

### 3. Docker Tag Strategy

- **Release builds**: `version` + `latest`
- **Development builds**: `version-dev.build.commit` + `branch-latest`
- **Feature branches**: `version-dev.build.commit` + `branch-latest` (don't use generic `latest`)

### 4. Automation

- ✅ Auto-increment patch version for dev builds
- ✅ Auto-create tags for parameterized releases
- ✅ Auto-push tags after successful build
- ❌ Don't auto-create tags for every commit

### 5. Documentation

- Document version in `CHANGELOG.md`
- Update version in `README.md` for major releases
- Tag releases in GitHub/GitLab with release notes

---

## Quick Reference

### Git Commands

```bash
# List all tags
git tag -l 'quarkus-base-v*'

# Get latest tag
git tag -l 'quarkus-base-v*' | sort -V | tail -1

# Create release tag
git tag -a quarkus-base-v1.2.3 -m "Release 1.2.3"

# Push tag
git push origin quarkus-base-v1.2.3

# Delete local tag
git tag -d quarkus-base-v1.2.3

# Delete remote tag
git push origin :refs/tags/quarkus-base-v1.2.3

# Get commit of tag
git rev-list -n 1 quarkus-base-v1.2.3
```

### Groovy Version Functions

```groovy
// Determine version
def versionInfo = versionLib.determineImageVersion('quarkus-base-v')

// Validate version
versionLib.isValidSemanticVersion('1.2.3')  // true
versionLib.isValidSemanticVersion('1.2.x')  // false

// Create release tag
versionLib.createReleaseTag('1.2.3', 'quarkus-base-v')

// Increment version
versionLib.incrementVersion('1.2.3', 'patch')  // 1.2.4
versionLib.incrementVersion('1.2.3', 'minor')  // 1.3.0
versionLib.incrementVersion('1.2.3', 'major')  // 2.0.0
```

---

## Support

For issues or questions:
1. Check Jenkins build logs for detailed error messages
2. Review this documentation for troubleshooting steps
3. Test version determination locally before Jenkins build
4. Contact DevOps team for Jenkins/credential issues

---

**Last Updated**: 2025-01-04
**Version**: 1.0.0
**Maintainer**: DevOps Team
