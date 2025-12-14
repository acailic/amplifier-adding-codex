# Docker Image Versioning Strategy - Complete Solution

## What This Is

A comprehensive, production-ready versioning strategy for Jenkins pipelines building Quarkus base Docker images. This solution ensures builds never fail due to version determination issues while maintaining proper semantic versioning.

## What You Get

### Core Files

1. **jenkins-version-strategy.groovy** (500+ lines)
   - Complete Groovy library with all versioning functions
   - Four-tier fallback strategy
   - Semantic version validation and increment
   - Git tag creation and management
   - Comprehensive error handling

2. **Jenkinsfile.quarkus-base-example** (200+ lines)
   - Complete pipeline implementation
   - Version determination
   - Docker build, tag, and push
   - Release tag creation
   - Parameterized build support

3. **VERSIONING_STRATEGY.md** (1000+ lines)
   - Complete documentation
   - Version determination strategies
   - Developer workflows
   - Testing procedures
   - Troubleshooting guide
   - Best practices

4. **QUICK_START.md**
   - Quick reference for developers
   - Common commands
   - Quick troubleshooting

5. **test-version-strategy.sh**
   - Local testing script
   - Simulates version determination
   - Diagnostic output

6. **VERSION_STRATEGY_SUMMARY.md**
   - Executive summary
   - Implementation checklist
   - Quick integration guide

## Quick Start

### For Developers - Create a Release

```bash
git checkout main
git pull origin main
git tag -a quarkus-base-v1.2.3 -m "Release 1.2.3"
git push origin quarkus-base-v1.2.3
```

Jenkins automatically builds and publishes release version `1.2.3`.

### For Jenkins Admins - Implement Solution

```bash
# 1. Copy library to repository
cp jenkins-version-strategy.groovy /path/to/claninfo-shared-lib/jenkins/

# 2. Update Jenkinsfile (see Jenkinsfile.quarkus-base-example)

# 3. Configure Jenkins credentials:
#    - docker-registry-credentials
#    - git-credentials

# 4. Test
./test-version-strategy.sh
```

## How It Works

### Version Determination Flow

```
Current Commit
    ↓
Has exact tag (quarkus-base-v1.2.3)?
    ↓ YES → Version: 1.2.3 (RELEASE)
    ↓ NO
    ↓
Find latest tag?
    ↓ YES → Increment + dev suffix
    │       Version: 1.2.4-dev.42.abc12345 (DEV)
    ↓ NO
    ↓
Use initial version
    Version: 0.1.0-dev.1.abc12345 (DEV)
    ↓
Error? → Fallback timestamp version
```

### Version Formats

| Type | Format | Example | Docker Tags |
|------|--------|---------|-------------|
| Release | X.Y.Z | 1.2.3 | 1.2.3, latest |
| Development | X.Y.Z-dev.BUILD.COMMIT | 1.2.4-dev.42.abc12345 | version, branch-latest |
| Initial | 0.1.0-dev.BUILD.COMMIT | 0.1.0-dev.1.abc12345 | version, branch-latest |
| Fallback | 0.0.0-TIMESTAMP.BUILD.COMMIT | 0.0.0-20250104-143022.1.unknown | version only |

## Key Features

### Reliability
- **Never fails**: Four-tier fallback ensures builds always complete
- **Error handling**: Graceful degradation when git operations fail
- **Safe defaults**: Sensible fallback versions for all scenarios

### Automation
- **Auto-increment**: Development versions automatically increment from latest tag
- **Auto-tagging**: Optional automatic tag creation for releases
- **Smart detection**: Distinguishes between release and development builds

### Flexibility
- **Manual releases**: Create tag and push, Jenkins handles rest
- **Parameterized releases**: Use Jenkins parameters for release builds
- **Branch support**: Different tagging strategy for feature branches

### Developer Experience
- **Simple workflow**: Just push code or create tags
- **Clear versioning**: Easy to understand version formats
- **Local testing**: Test version determination before CI
- **Good documentation**: Comprehensive guides for all scenarios

## Integration Example

Minimal Jenkinsfile integration:

```groovy
def versionLib = load 'jenkins/version-strategy.groovy'

pipeline {
    stages {
        stage('Initialize') {
            steps {
                script {
                    sh 'git fetch --tags || true'

                    def versionInfo = versionLib.determineImageVersion(
                        'quarkus-base-v',
                        env.BRANCH_NAME,
                        env.BUILD_NUMBER
                    )

                    versionLib.printVersionInfo(versionInfo)
                    env.IMAGE_VERSION = versionInfo.version
                    env.DOCKER_TAGS = versionInfo.dockerTags.join(',')
                }
            }
        }

        stage('Build') {
            steps {
                sh "docker build -t myregistry/quarkus-base:${env.IMAGE_VERSION} ."
            }
        }
    }
}
```

## File Guide

### Which File to Read When

**Starting out?**
→ Read this file (VERSION_STRATEGY_README.md)

**Need quick commands?**
→ Read QUICK_START.md

**Implementing in Jenkins?**
→ Read VERSION_STRATEGY_SUMMARY.md

**Need detailed documentation?**
→ Read VERSIONING_STRATEGY.md

**Want to see complete pipeline?**
→ Read Jenkinsfile.quarkus-base-example

**Need to test locally?**
→ Run test-version-strategy.sh

**Integrating into code?**
→ Read jenkins-version-strategy.groovy comments

## Common Use Cases

### Use Case 1: Regular Development

**Scenario**: Working on feature branch

**What happens**:
```bash
git checkout -b feature/optimization
# make changes
git commit -m "Optimize startup"
git push origin feature/optimization
```

**Result**:
- Jenkins builds automatically
- Version: `1.2.4-dev.42.abc12345`
- Docker tags: `1.2.4-dev.42.abc12345`, `feature-optimization-latest`

### Use Case 2: Release from Main

**Scenario**: Ready to release version 1.3.0

**What happens**:
```bash
git checkout main
git pull origin main
git tag -a quarkus-base-v1.3.0 -m "Release 1.3.0 - New features"
git push origin quarkus-base-v1.3.0
```

**Result**:
- Jenkins detects tag
- Version: `1.3.0`
- Docker tags: `1.3.0`, `latest`
- Images published to registry

### Use Case 3: Jenkins Parameterized Release

**Scenario**: Create release via Jenkins UI

**What happens**:
1. Go to Jenkins job
2. Click "Build with Parameters"
3. Set `CREATE_RELEASE` = true
4. Set `RELEASE_VERSION` = 1.3.0
5. Click "Build"

**Result**:
- Jenkins creates git tag `quarkus-base-v1.3.0`
- Builds version `1.3.0`
- Publishes with tags: `1.3.0`, `latest`

### Use Case 4: First Build Ever

**Scenario**: Brand new repository, no tags exist

**What happens**:
```bash
git commit -m "Initial Quarkus base image"
git push origin main
```

**Result**:
- Jenkins detects no tags
- Version: `0.1.0-dev.1.abc12345`
- Docker tags: `0.1.0-dev.1.abc12345`, `main-latest`

## Testing Before Deployment

### Test 1: Local Version Determination

```bash
chmod +x test-version-strategy.sh
./test-version-strategy.sh
```

Expected output shows which strategy would be used.

### Test 2: Groovy Syntax

```bash
# Validate Groovy syntax
groovy -c jenkins-version-strategy.groovy
```

### Test 3: Jenkins Dry Run

```bash
# In Jenkins workspace
sh 'git fetch --tags'
sh 'git tag -l "quarkus-base-v*" | sort -V | tail -1'
sh 'git tag --points-at HEAD'
```

## Migration from Existing Setup

### If you currently use manual VERSION file:

```groovy
// Old way
env.IMAGE_VERSION = readFile('VERSION').trim()

// New way
def versionInfo = versionLib.determineImageVersion('quarkus-base-v')
env.IMAGE_VERSION = versionInfo.version
```

### If you currently use build number only:

```groovy
// Old way
env.IMAGE_VERSION = "build-${env.BUILD_NUMBER}"

// New way
def versionInfo = versionLib.determineImageVersion('quarkus-base-v')
env.IMAGE_VERSION = versionInfo.version
// Now: 1.2.4-dev.42.abc12345 instead of build-42
```

### If you currently fail on missing tags:

```groovy
// Old way (fails if no tag)
env.IMAGE_VERSION = sh(
    script: "git describe --tags --match 'quarkus-base-v*'",
    returnStdout: true
).trim()

// New way (never fails)
def versionInfo = versionLib.determineImageVersion('quarkus-base-v')
env.IMAGE_VERSION = versionInfo.version
```

## Benefits Summary

| Before | After |
|--------|-------|
| Builds fail without tags | Builds never fail |
| Manual version management | Automatic version generation |
| No version standards | Semantic versioning enforced |
| Unclear dev vs release | Clear version differentiation |
| No fallback strategy | Four-tier fallback |
| No local testing | Test script provided |
| Poor documentation | Comprehensive docs |

## Implementation Checklist

- [ ] Review all documentation
- [ ] Test locally with test script
- [ ] Copy jenkins-version-strategy.groovy to repository
- [ ] Update Jenkinsfile (use example as reference)
- [ ] Configure Jenkins credentials
- [ ] Test development build
- [ ] Test release build (create tag)
- [ ] Verify Docker images in registry
- [ ] Share QUICK_START.md with team
- [ ] Create runbook for releases

## Support

### Documentation Files

| Question | File to Read |
|----------|--------------|
| How do I create a release? | QUICK_START.md |
| How does version determination work? | VERSIONING_STRATEGY.md |
| How do I implement this? | VERSION_STRATEGY_SUMMARY.md |
| How do I test locally? | Run test-version-strategy.sh |
| What does the complete pipeline look like? | Jenkinsfile.quarkus-base-example |
| How do the functions work? | jenkins-version-strategy.groovy |

### Common Issues

See VERSIONING_STRATEGY.md section "Troubleshooting" for:
- Tag not detected
- Invalid version errors
- Permission issues
- Version not incrementing
- Docker tag issues

## Conclusion

This solution provides everything needed for production-ready Docker image versioning:

1. **Robust version determination** - Never fails, always produces valid version
2. **Complete implementation** - Library + Pipeline + Documentation + Tests
3. **Developer-friendly** - Simple workflows, clear conventions
4. **Production-ready** - Error handling, fallbacks, validation
5. **Well-documented** - Multiple documentation levels for different needs

All files are in `/testing` directory and ready for immediate use.

## Next Steps

1. **Read**: Start with this README, then QUICK_START.md
2. **Test**: Run test-version-strategy.sh locally
3. **Review**: Check jenkins-version-strategy.groovy and Jenkinsfile example
4. **Implement**: Follow VERSION_STRATEGY_SUMMARY.md checklist
5. **Deploy**: Test in Jenkins, then use in production
6. **Share**: Give team access to QUICK_START.md

---

**Version**: 1.0.0
**Date**: 2025-01-04
**Repository**: claninfo-shared-lib
**Purpose**: Quarkus base Docker image versioning
