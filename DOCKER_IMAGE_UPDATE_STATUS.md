# Docker Base Image Update Status

**Target Image:** `registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11`
**Branch Name:** `update-docker-base-image`

## ✅ Completed Projects

### 1. API Gateway
- **Status:** ✅ DONE
- **Branch:** `update-docker-base-image`
- **Changes:** Updated from `eclipse-temurin:11-jre-jammy` to `java-runtime-base:17-11`
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/api-gateway`
- **Next Steps:**
  ```bash
  cd /Users/aleksandarilic/Documents/github/claninfo/api-gateway
  git add Dockerfile
  git commit -m "Update Docker base image to java-runtime-base:17-11"
  git push -u origin update-docker-base-image
  ```

### 2. Camunda BPMN
- **Status:** ✅ DONE
- **Branch:** `update-docker-base-image` (created from `dev`)
- **Changes:** Updated from `openjdk:11-jdk-slim` to `java-runtime-base:17-11`
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/camunda-bpmn`
- **Next Steps:**
  ```bash
  cd /Users/aleksandarilic/Documents/github/claninfo/camunda-bpmn
  git add Dockerfile
  git commit -m "Update Docker base image to java-runtime-base:17-11"
  git push -u origin update-docker-base-image
  ```

## ⚠️ Projects Requiring Manual Handling (Uncommitted Changes)

### 3. DMS Service
- **Status:** ⚠️ NEEDS ATTENTION
- **Current Branch:** `POR-555-update-trivy`
- **Uncommitted Files:** 10 files (including Dockerfile)
- **Issue:** Already has uncommitted Dockerfile changes
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/dms-service`
- **Recommendation:**
  1. Review the current Dockerfile changes
  2. Decide whether to include Docker base image update in current branch or create separate branch
  ```bash
  cd /Users/aleksandarilic/Documents/github/claninfo/dms-service
  git status
  # Option A: Update Dockerfile in current branch
  # Edit Dockerfile: FROM eclipse-temurin:17-jre-jammy -> FROM registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11
  # Commit with other changes

  # Option B: Stash changes, create new branch
  git stash push -m "Stash for Docker image update"
  git checkout -b update-docker-base-image dev-new
  # Edit Dockerfile
  git add Dockerfile
  git commit -m "Update Docker base image to java-runtime-base:17-11"
  git stash pop  # Re-apply stashed changes later
  ```

### 4. DMS Document Poller
- **Status:** ⚠️ NEEDS ATTENTION
- **Current Branch:** `POR-555-security-updates`
- **Uncommitted Files:** 11 files
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/dms-document-poller`
- **Current Dockerfile:** Uses `eclipse-temurin:17-jre-jammy`
- **Recommendation:** Same as DMS Service above

### 5. Notification Service
- **Status:** ⚠️ NEEDS ATTENTION
- **Current Branch:** `POR-555`
- **Uncommitted Files:** 6 files
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/notification-service`
- **Current Dockerfile:** Uses `eclipse-temurin:17-jre-jammy`
- **Recommendation:** Same as DMS Service above

### 6. Reporting Service
- **Status:** ⚠️ NEEDS ATTENTION
- **Current Branch:** `POR-555-security-updates`
- **Uncommitted Files:** 7 files
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/reporting-service`
- **Current Dockerfile:** Uses `eclipse-temurin:17-jre-jammy`
- **Recommendation:** Same as DMS Service above

### 7. DB Transfer Syncer
- **Status:** ⚠️ NEEDS ATTENTION
- **Current Branch:** `update-logging`
- **Uncommitted Files:** 14 files
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/db-transfer-syncer`
- **Current Dockerfile:** Uses `eclipse-temurin:17-jre-jammy`
- **Recommendation:** Same as DMS Service above

## ❓ Special Case - Auth Service

### 8. Swarm Auth Service
- **Status:** ❓ REQUIRES DECISION
- **Current Branch:** `fix/maven-cache-cleaning-dev-new`
- **Uncommitted Files:** 13 files
- **Location:** `/Users/aleksandarilic/Documents/github/claninfo/swarm-auth-service`
- **Current Dockerfile:** Uses `registry.access.redhat.com/ubi8/ubi-minimal:8.10` (Quarkus-specific)
- **Issue:** This is a Quarkus application using Red Hat UBI image. Switching to java-runtime-base may break Quarkus-specific features.
- **Recommendation:**
  - **Consult with team** before changing this image
  - Quarkus applications often have specific base image requirements
  - May need to stay on UBI or use a Quarkus-specific image
  - If changing, extensive testing required

## Summary

| Project | Status | Base Branch | Has Uncommitted Changes |
|---------|--------|-------------|------------------------|
| API Gateway | ✅ Done | dev-new | Yes (Dockerfile updated) |
| Camunda BPMN | ✅ Done | dev | No |
| DMS Service | ⚠️ Manual | dev-new | Yes (10 files) |
| DMS Poller | ⚠️ Manual | dev-new | Yes (11 files) |
| Notification Service | ⚠️ Manual | dev-new | Yes (6 files) |
| Reporting Service | ⚠️ Manual | dev-new | Yes (7 files) |
| DB Syncer | ⚠️ Manual | dev-new | Yes (14 files) |
| Auth Service | ❓ Consult | dev-new | Yes (13 files) + Quarkus |

## Quick Commands Reference

### For completed projects (API Gateway, Camunda):
```bash
# API Gateway
cd /Users/aleksandarilic/Documents/github/claninfo/api-gateway
git add Dockerfile
git commit -m "Update Docker base image to java-runtime-base:17-11"
git push -u origin update-docker-base-image

# Camunda
cd /Users/aleksandarilic/Documents/github/claninfo/camunda-bpmn
git add Dockerfile
git commit -m "Update Docker base image to java-runtime-base:17-11"
git push -u origin update-docker-base-image
```

### For projects with uncommitted changes:

**Option A - Include in current branch:**
```bash
cd /path/to/project
# Manually edit Dockerfile line 1: FROM registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11
git add Dockerfile
git commit -m "Update Docker base image to java-runtime-base:17-11"
```

**Option B - Create separate branch:**
```bash
cd /path/to/project
git stash push -m "Stash for Docker image update"
git checkout -b update-docker-base-image dev-new
# Manually edit Dockerfile line 1
git add Dockerfile
git commit -m "Update Docker base image to java-runtime-base:17-11"
git push -u origin update-docker-base-image
# Then decide when to apply stashed changes
```

## Required Dockerfile Changes

For all projects except Auth Service, change line 1:

**Before:**
```dockerfile
FROM eclipse-temurin:11-jre-jammy
# or
FROM eclipse-temurin:17-jre-jammy
```

**After:**
```dockerfile
FROM registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11
```

## Testing Recommendations

After updating each project:
1. Build the Docker image locally
2. Run basic smoke tests
3. Verify the application starts correctly
4. Check for any Java version compatibility issues (especially for projects moving from Java 11)

```bash
# Build and test
docker build -t project-name:test .
docker run --rm project-name:test
```
