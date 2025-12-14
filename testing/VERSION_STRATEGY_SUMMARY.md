# Docker Image Versioning Strategy - Summary

## Overview

Complete versioning solution for Jenkins pipeline building Quarkus base Docker images with robust fallback mechanisms and semantic versioning support.

## Deliverables

All files are located in the `/testing` directory:

1. **jenkins-version-strategy.groovy** - Core versioning library with all functions
2. **Jenkinsfile.quarkus-base-example** - Complete pipeline implementation example
3. **VERSIONING_STRATEGY.md** - Comprehensive documentation (50+ pages)
4. **QUICK_START.md** - Quick reference for developers and admins
5. **test-version-strategy.sh** - Local testing script
6. **VERSION_STRATEGY_SUMMARY.md** - This file

## Solution Architecture

### Four-Tier Version Determination

```
1. Exact Tag (Release)
   └─> Current commit has tag: quarkus-base-v1.2.3
       Result: 1.2.3
       Tags: 1.2.3, latest

2. Latest Tag + Increment (Development)
   └─> Latest tag: quarkus-base-v1.2.3
       Result: 1.2.4-dev.42.abc12345
       Tags: 1.2.4-dev.42.abc12345, {branch}-latest

3. Initial Version (No Tags)
   └─> No tags exist
       Result: 0.1.0-dev.1.abc12345
       Tags: 0.1.0-dev.1.abc12345, {branch}-latest

4. Fallback (Error Recovery)
   └─> All methods fail
       Result: 0.0.0-20250104-143022.1.unknown
       Tags: 0.0.0-20250104-143022.1.unknown
```

## Key Features

### Reliability
- Never fails due to version determination
- Multiple fallback strategies
- Comprehensive error handling
- Safe defaults for all scenarios

### Semantic Versioning
- Strict X.Y.Z format for releases
- Automatic patch increment for dev builds
- Support for major/minor/patch increments
- Validation of version formats

### Docker Integration
- Multiple tag strategy (version + latest/branch-latest)
- Release vs development tag differentiation
- Build metadata in development versions
- Configurable tag prefix

### Developer Experience
- Automated version generation
- Manual release option via parameterized builds
- Local testing capability
- Clear version information in build logs

## Implementation Steps

### For claninfo-shared-lib Repository

#### Step 1: Add Files to Repository

```bash
# Create jenkins directory
mkdir -p jenkins

# Copy versioning library
cp jenkins-version-strategy.groovy jenkins/version-strategy.groovy

# Commit
git add jenkins/version-strategy.groovy
git commit -m "Add Docker image versioning strategy"
git push origin main
```

#### Step 2: Update Jenkinsfile

Add to your existing Jenkinsfile:

```groovy
// Load versioning library
def versionLib = load 'jenkins/version-strategy.groovy'

pipeline {
    environment {
        TAG_PREFIX = 'quarkus-base-v'
        // IMAGE_VERSION set in Initialize stage
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    // Fetch latest tags
                    sh 'git fetch --tags || true'

                    // Determine version
                    def versionInfo = versionLib.determineImageVersion(
                        env.TAG_PREFIX,
                        env.BRANCH_NAME,
                        env.BUILD_NUMBER
                    )

                    // Print version information
                    versionLib.printVersionInfo(versionInfo)

                    // Set environment variables
                    env.IMAGE_VERSION = versionInfo.version
                    env.DOCKER_TAGS = versionInfo.dockerTags.join(',')
                    env.IS_RELEASE = versionInfo.isRelease.toString()

                    // Update build description
                    currentBuild.description = "Version: ${env.IMAGE_VERSION}"
                }
            }
        }

        // Your existing build stages here
        // Use ${env.IMAGE_VERSION} for Docker tagging
    }
}
```

#### Step 3: Configure Jenkins Credentials

In Jenkins, add these credentials:

1. **docker-registry-credentials**
   - Type: Username with password
   - ID: `docker-registry-credentials`
   - Description: Docker registry access

2. **git-credentials**
   - Type: Username with password
   - ID: `git-credentials`
   - Description: Git push access for creating tags

#### Step 4: Test the Setup

```bash
# Test locally first
./test-version-strategy.sh

# Then trigger Jenkins build
# Check build logs for version determination output
```

## Usage Examples

### For Developers

#### Create a Release

```bash
# Method 1: Manual tag (recommended)
git checkout main
git pull origin main
git tag -a quarkus-base-v1.2.3 -m "Release 1.2.3 - Bug fixes"
git push origin quarkus-base-v1.2.3
# Jenkins will automatically build and publish

# Method 2: Jenkins parameterized build
# Go to Jenkins > Build with Parameters
# Set CREATE_RELEASE = true
# Set RELEASE_VERSION = 1.2.3
# Click Build
```

#### Development Workflow

```bash
# Just push your changes - no action needed
git checkout -b feature/optimization
git commit -m "Optimize startup"
git push origin feature/optimization
# Jenkins automatically creates dev version: 1.2.4-dev.42.abc12345
```

### For Jenkins Admins

#### Verify Version Determination

Check Initialize stage logs:

```
════════════════════════════════════════════════════════════
║ VERSION DETERMINATION RESULTS
╠════════════════════════════════════════════════════════════
║ Source:        latest-tag-incremented
║ Version:       1.2.4-dev.42.abc12345
║ Is Release:    false
║ Docker Tags:   1.2.4-dev.42.abc12345, feature-xyz-latest
╚════════════════════════════════════════════════════════════
```

#### Troubleshoot Version Issues

```bash
# In Jenkins workspace
git fetch --tags
git tag -l 'quarkus-base-v*'
git tag --points-at HEAD

# Expected output shows tags
```

## Version Format Specification

### Release Versions
```
Format: MAJOR.MINOR.PATCH
Example: 1.2.3
```

### Development Versions
```
Format: MAJOR.MINOR.PATCH-dev.BUILD.COMMIT
Example: 1.2.4-dev.42.abc12345
Parts:
  - 1.2.4: Next version after latest tag
  - dev: Development build marker
  - 42: Jenkins BUILD_NUMBER
  - abc12345: Git commit hash (short)
```

### Git Tags
```
Format: {prefix}{version}
Prefix: quarkus-base-v (configurable)
Example: quarkus-base-v1.2.3

Rules:
  - Must use annotated tags: git tag -a
  - Version must be semantic: X.Y.Z
  - No pre-release identifiers in tags
```

## Integration with Existing Pipeline

### Minimal Integration

If you have existing Jenkinsfile, just add Initialize stage:

```groovy
def versionLib = load 'jenkins/version-strategy.groovy'

pipeline {
    stages {
        stage('Initialize') {
            steps {
                script {
                    sh 'git fetch --tags || true'
                    def versionInfo = versionLib.determineImageVersion('quarkus-base-v')
                    versionLib.printVersionInfo(versionInfo)
                    env.IMAGE_VERSION = versionInfo.version
                }
            }
        }

        // Your existing stages
    }
}
```

### Full Integration

See `Jenkinsfile.quarkus-base-example` for complete pipeline with:
- Version determination
- Docker build and tag
- Image testing
- Registry push
- Release tag creation
- Comprehensive error handling

## Testing Strategy

### Local Testing

```bash
# Run test script
chmod +x test-version-strategy.sh
./test-version-strategy.sh

# Expected output shows version determination strategy
```

### Jenkins Testing

1. **Test Development Build**
   - Push to feature branch
   - Verify version: X.Y.Z-dev.BUILD.COMMIT

2. **Test Release Build**
   - Create tag: quarkus-base-v1.2.3
   - Push tag
   - Verify version: 1.2.3

3. **Test Fallback**
   - Temporarily break git (for testing)
   - Verify build doesn't fail
   - Verify fallback version created

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| "No tag found" | Check: `git tag -l 'quarkus-base-v*'` |
| "Invalid version" | Verify tag format: `quarkus-base-vX.Y.Z` |
| "Permission denied" | Check Jenkins credentials: `git-credentials` |
| "Version not incrementing" | Verify `sort -V` available in Jenkins |
| Build fails | Check fallback - should never fail |

## Benefits

### Before This Solution
- Builds failed when VERSION couldn't be determined
- Manual version management required
- No standardized versioning approach
- Difficult to track releases vs development builds

### After This Solution
- Builds never fail due to version issues
- Automatic version generation
- Semantic versioning enforced
- Clear distinction between releases and dev builds
- Easy release process (just create a tag)
- Local testing capability
- Comprehensive documentation

## Files Reference

### Main Files

| File | Purpose | Location |
|------|---------|----------|
| jenkins-version-strategy.groovy | Core library | Place in repo at jenkins/ |
| Jenkinsfile.quarkus-base-example | Pipeline example | Reference for implementation |
| VERSIONING_STRATEGY.md | Full documentation | For detailed information |
| QUICK_START.md | Quick reference | For daily use |
| test-version-strategy.sh | Testing script | Run locally |

### Implementation Checklist

- [ ] Copy `jenkins-version-strategy.groovy` to repo
- [ ] Update Jenkinsfile with Initialize stage
- [ ] Add Jenkins credentials (docker-registry, git)
- [ ] Test locally with test script
- [ ] Trigger test build in Jenkins
- [ ] Verify version determination in logs
- [ ] Test release process (create tag)
- [ ] Verify Docker images tagged correctly
- [ ] Document for team (use QUICK_START.md)
- [ ] Create first release tag

## Next Steps

1. **Review the solution**: Examine all files in `/testing` directory
2. **Test locally**: Run `test-version-strategy.sh` in a git repo
3. **Implement in Jenkins**: Follow Implementation Steps above
4. **Create documentation**: Share QUICK_START.md with team
5. **Test thoroughly**: Development build, release build, edge cases
6. **Deploy**: Use in production pipeline

## Support and Resources

- **Full Documentation**: `VERSIONING_STRATEGY.md` - 50+ pages covering everything
- **Quick Reference**: `QUICK_START.md` - Common commands and workflows
- **Example Pipeline**: `Jenkinsfile.quarkus-base-example` - Complete implementation
- **Testing**: `test-version-strategy.sh` - Local testing capability
- **Library Code**: `jenkins-version-strategy.groovy` - Well-documented functions

## Conclusion

This solution provides a production-ready versioning strategy with:

- **Reliability**: Never fails, multiple fallback mechanisms
- **Flexibility**: Works for releases and development builds
- **Automation**: Minimal manual intervention required
- **Clarity**: Clear version formats and documentation
- **Testing**: Local and CI testing capabilities

The implementation is designed to be:
- Easy to integrate into existing pipelines
- Well-documented for team adoption
- Testable before deployment
- Maintainable long-term

All files are ready for immediate use in the claninfo-shared-lib repository.
