# Quick Start Guide: Docker Image Versioning

## For Developers

### Creating a Release

**Simple Method (Recommended)**:
```bash
# 1. Checkout main branch
git checkout main
git pull origin main

# 2. Create and push tag
git tag -a quarkus-base-v1.2.3 -m "Release 1.2.3 - Description"
git push origin quarkus-base-v1.2.3

# 3. Jenkins will automatically build and publish
```

**Jenkins Parameterized Method**:
1. Go to Jenkins job
2. Click "Build with Parameters"
3. Set `CREATE_RELEASE` = ✅
4. Set `RELEASE_VERSION` = `1.2.3`
5. Click "Build"

### Testing Version Locally

```bash
# Run test script
cd /path/to/claninfo-shared-lib
chmod +x test-version-strategy.sh
./test-version-strategy.sh

# Or test manually
git tag -l 'quarkus-base-v*' | sort -V | tail -1
```

### Development Workflow

**No action needed!** Jenkins automatically:
1. Detects you're not on a tagged commit
2. Finds latest release (e.g., `v1.2.3`)
3. Generates dev version: `1.2.4-dev.42.abc12345`
4. Tags image with dev version + `{branch}-latest`

## For Jenkins Admins

### Installation

1. **Add version library to repo**:
```bash
mkdir -p jenkins
cp jenkins-version-strategy.groovy jenkins/version-strategy.groovy
git add jenkins/version-strategy.groovy
git commit -m "Add version determination library"
git push
```

2. **Update Jenkinsfile**:
```groovy
def versionLib = load 'jenkins/version-strategy.groovy'

pipeline {
    stages {
        stage('Initialize') {
            steps {
                script {
                    def versionInfo = versionLib.determineImageVersion('quarkus-base-v')
                    versionLib.printVersionInfo(versionInfo)
                    env.IMAGE_VERSION = versionInfo.version
                }
            }
        }
    }
}
```

3. **Add credentials**:
   - `docker-registry-credentials` (Docker registry access)
   - `git-credentials` (Git push access for tags)

### Troubleshooting

**Build fails with "No version"**:
```bash
# Check git in Jenkins workspace
git fetch --tags
git tag -l 'quarkus-base-v*'
```

**Tag not detected**:
```bash
# Verify tag format (must be exact)
git tag -l 'quarkus-base-v*' | grep -E '^quarkus-base-v[0-9]+\.[0-9]+\.[0-9]+$'
```

## Version Format Examples

| Scenario | Tag | Version Generated | Docker Tags |
|----------|-----|------------------|-------------|
| Release build | `quarkus-base-v1.2.3` | `1.2.3` | `1.2.3`, `latest` |
| Dev build (main) | (none) | `1.2.4-dev.42.abc1234` | `1.2.4-dev.42.abc1234`, `main-latest` |
| Feature branch | (none) | `1.2.4-dev.42.abc1234` | `1.2.4-dev.42.abc1234`, `feature-xyz-latest` |
| First build ever | (none) | `0.1.0-dev.1.abc1234` | `0.1.0-dev.1.abc1234`, `main-latest` |

## Common Commands

```bash
# List all releases
git tag -l 'quarkus-base-v*' | sort -V

# Get latest release
git tag -l 'quarkus-base-v*' | sort -V | tail -1

# Check current commit tags
git tag --points-at HEAD

# Create release tag
git tag -a quarkus-base-v1.2.3 -m "Release 1.2.3"

# Push tag
git push origin quarkus-base-v1.2.3

# Delete wrong tag (local then remote)
git tag -d quarkus-base-v1.2.3
git push origin :refs/tags/quarkus-base-v1.2.3
```

## Version Increment Rules

| Change | Increment | Example |
|--------|-----------|---------|
| Breaking changes | MAJOR | 1.2.3 → 2.0.0 |
| New features | MINOR | 1.2.3 → 1.3.0 |
| Bug fixes | PATCH | 1.2.3 → 1.2.4 |

## Support

- **Full Documentation**: See `VERSIONING_STRATEGY.md`
- **Test Script**: Run `./test-version-strategy.sh`
- **Jenkins Pipeline**: See `Jenkinsfile.quarkus-base-example`
- **Library Code**: See `jenkins-version-strategy.groovy`
