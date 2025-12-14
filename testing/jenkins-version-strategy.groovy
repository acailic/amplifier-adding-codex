/**
 * Robust Image Version Determination Strategy for Quarkus Base Images
 * Repository: claninfo-shared-lib
 *
 * This Groovy library provides a comprehensive versioning strategy with:
 * - Primary: Git tag-based semantic versioning
 * - Fallback: Build-based version generation
 * - Support for development/release branches
 * - Docker image tagging integration
 */

/**
 * Determines the IMAGE_VERSION for Docker builds
 *
 * Strategy:
 * 1. Try to get version from git tag matching pattern (e.g., quarkus-base-v1.2.3)
 * 2. If no tag found, generate version from commit info
 * 3. Add build metadata for non-release builds
 * 4. Support multiple Docker tags (versioned + latest)
 *
 * @param tagPrefix The prefix for version tags (e.g., "quarkus-base-v")
 * @param branchName The git branch name (defaults to env.BRANCH_NAME)
 * @param buildNumber The Jenkins build number (defaults to env.BUILD_NUMBER)
 * @return Map containing version information
 */
def determineImageVersion(String tagPrefix = "quarkus-base-v", String branchName = null, String buildNumber = null) {
    branchName = branchName ?: env.BRANCH_NAME ?: getCurrentBranch()
    buildNumber = buildNumber ?: env.BUILD_NUMBER ?: "0"

    echo "Determining version for prefix: ${tagPrefix}, branch: ${branchName}, build: ${buildNumber}"

    // Normalize tag prefix (ensure it ends without trailing characters)
    def normalizedPrefix = tagPrefix.replaceAll(/[\/\*]+$/, '')

    def versionInfo = [:]

    try {
        // Strategy 1: Get version from exact tag on current commit
        def exactTag = getExactTag(normalizedPrefix)
        if (exactTag) {
            versionInfo.source = 'exact-tag'
            versionInfo.tag = exactTag
            versionInfo.version = extractVersionFromTag(exactTag, normalizedPrefix)
            versionInfo.isRelease = true
            versionInfo.dockerTags = [versionInfo.version, 'latest']
            echo "Found exact tag: ${exactTag}, version: ${versionInfo.version}"
            return versionInfo
        }

        // Strategy 2: Get latest tag and increment for development
        def latestTag = getLatestTag(normalizedPrefix)
        if (latestTag) {
            def latestVersion = extractVersionFromTag(latestTag, normalizedPrefix)
            def nextVersion = incrementVersion(latestVersion, 'patch')
            def commitShort = getCommitShort()

            versionInfo.source = 'latest-tag-incremented'
            versionInfo.latestTag = latestTag
            versionInfo.latestVersion = latestVersion
            versionInfo.version = "${nextVersion}-dev.${buildNumber}.${commitShort}"
            versionInfo.isRelease = false
            versionInfo.dockerTags = [versionInfo.version, "${branchName}-latest"]

            echo "Latest tag: ${latestTag}, generated version: ${versionInfo.version}"
            return versionInfo
        }

        // Strategy 3: No tags exist - start with initial version
        def commitShort = getCommitShort()
        def initialVersion = "0.1.0"

        versionInfo.source = 'initial-version'
        versionInfo.version = "${initialVersion}-dev.${buildNumber}.${commitShort}"
        versionInfo.isRelease = false
        versionInfo.dockerTags = [versionInfo.version, "${branchName}-latest"]

        echo "No tags found, using initial version: ${versionInfo.version}"
        return versionInfo

    } catch (Exception e) {
        // Strategy 4: Complete fallback using timestamp
        def timestamp = new Date().format('yyyyMMdd-HHmmss')
        def commitShort = getCommitShortSafe()

        versionInfo.source = 'fallback'
        versionInfo.version = "0.0.0-${timestamp}.${buildNumber}.${commitShort}"
        versionInfo.isRelease = false
        versionInfo.dockerTags = [versionInfo.version]
        versionInfo.error = e.message

        echo "ERROR determining version, using fallback: ${versionInfo.version}"
        echo "Error details: ${e.message}"
        return versionInfo
    }
}

/**
 * Gets the exact tag on the current commit matching the prefix
 */
def getExactTag(String tagPrefix) {
    try {
        // Get tags pointing to current commit
        def tags = sh(
            script: "git tag --points-at HEAD | grep '^${tagPrefix}' | sort -V | tail -1 || true",
            returnStdout: true
        ).trim()

        return tags ?: null
    } catch (Exception e) {
        echo "Could not get exact tag: ${e.message}"
        return null
    }
}

/**
 * Gets the latest tag matching the prefix
 */
def getLatestTag(String tagPrefix) {
    try {
        // Fetch tags from remote
        sh "git fetch --tags || true"

        // Get all tags matching prefix, sorted by version
        def tag = sh(
            script: """
                git tag -l '${tagPrefix}*' | \
                grep -E '^${tagPrefix}[0-9]+\\.[0-9]+\\.[0-9]+\$' | \
                sort -V | \
                tail -1 || true
            """,
            returnStdout: true
        ).trim()

        return tag ?: null
    } catch (Exception e) {
        echo "Could not get latest tag: ${e.message}"
        return null
    }
}

/**
 * Extracts semantic version from tag name
 */
def extractVersionFromTag(String tag, String prefix) {
    // Remove prefix and extract version
    def version = tag.replaceFirst("^${prefix}", '')

    // Validate semantic version format
    if (version =~ /^\d+\.\d+\.\d+$/) {
        return version
    }

    throw new Exception("Invalid semantic version in tag: ${tag}")
}

/**
 * Increments a semantic version
 * @param version Current version (e.g., "1.2.3")
 * @param part Which part to increment: 'major', 'minor', 'patch'
 */
def incrementVersion(String version, String part = 'patch') {
    def parts = version.tokenize('.')
    def major = parts[0].toInteger()
    def minor = parts[1].toInteger()
    def patch = parts[2].toInteger()

    switch (part) {
        case 'major':
            major++
            minor = 0
            patch = 0
            break
        case 'minor':
            minor++
            patch = 0
            break
        case 'patch':
        default:
            patch++
            break
    }

    return "${major}.${minor}.${patch}"
}

/**
 * Gets short commit hash
 */
def getCommitShort() {
    return sh(
        script: 'git rev-parse --short=8 HEAD',
        returnStdout: true
    ).trim()
}

/**
 * Gets short commit hash with error handling
 */
def getCommitShortSafe() {
    try {
        return getCommitShort()
    } catch (Exception e) {
        return "unknown"
    }
}

/**
 * Gets current branch name
 */
def getCurrentBranch() {
    try {
        return sh(
            script: 'git rev-parse --abbrev-ref HEAD',
            returnStdout: true
        ).trim()
    } catch (Exception e) {
        return "unknown"
    }
}

/**
 * Creates a release tag for the current commit
 * This should be called after successful release builds
 *
 * @param version The semantic version to tag (e.g., "1.2.3")
 * @param tagPrefix The prefix for the tag (e.g., "quarkus-base-v")
 * @param message Optional tag message
 */
def createReleaseTag(String version, String tagPrefix = "quarkus-base-v", String message = null) {
    if (!version || !(version =~ /^\d+\.\d+\.\d+$/)) {
        error "Invalid semantic version: ${version}. Must be in format X.Y.Z"
    }

    def tagName = "${tagPrefix}${version}"
    def tagMessage = message ?: "Release ${tagName}"

    echo "Creating release tag: ${tagName}"

    try {
        // Create annotated tag
        sh """
            git tag -a '${tagName}' -m '${tagMessage}'
            git push origin '${tagName}'
        """
        echo "Successfully created and pushed tag: ${tagName}"
    } catch (Exception e) {
        error "Failed to create release tag: ${e.message}"
    }
}

/**
 * Validates if a version string is valid semantic version
 */
def isValidSemanticVersion(String version) {
    return version =~ /^\d+\.\d+\.\d+$/
}

/**
 * Pretty print version information
 */
def printVersionInfo(Map versionInfo) {
    echo "╔════════════════════════════════════════════════════════════"
    echo "║ VERSION DETERMINATION RESULTS"
    echo "╠════════════════════════════════════════════════════════════"
    echo "║ Source:        ${versionInfo.source}"
    echo "║ Version:       ${versionInfo.version}"
    echo "║ Is Release:    ${versionInfo.isRelease}"
    echo "║ Docker Tags:   ${versionInfo.dockerTags.join(', ')}"

    if (versionInfo.latestTag) {
        echo "║ Latest Tag:    ${versionInfo.latestTag}"
        echo "║ Base Version:  ${versionInfo.latestVersion}"
    }

    if (versionInfo.error) {
        echo "║ ⚠️  Warning:    ${versionInfo.error}"
    }

    echo "╚════════════════════════════════════════════════════════════"
}

// Make functions available when loaded as library
return this
