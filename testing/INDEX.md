# Docker Image Versioning Strategy - File Index

## Quick Navigation

### Start Here
📋 **VERSION_STRATEGY_README.md** - Overview and getting started guide

### Implementation
🔧 **jenkins-version-strategy.groovy** - Core versioning library (copy this to your repo)
📝 **Jenkinsfile.quarkus-base-example** - Complete pipeline implementation example
✅ **VERSION_STRATEGY_SUMMARY.md** - Implementation checklist and integration guide

### Documentation
📚 **VERSIONING_STRATEGY.md** - Complete documentation (1000+ lines)
🚀 **QUICK_START.md** - Quick reference for daily use

### Testing
🧪 **test-version-strategy.sh** - Local testing script

---

## File Descriptions

### jenkins-version-strategy.groovy
**Size**: ~500 lines
**Purpose**: Core Groovy library with all versioning logic
**Contains**:
- determineImageVersion() - Main version determination function
- getExactTag() - Check for release tags
- getLatestTag() - Find latest version tag
- incrementVersion() - Semantic version increment
- createReleaseTag() - Create and push git tags
- Validation and error handling functions

**Usage**: Load in Jenkinsfile with `def versionLib = load 'jenkins/version-strategy.groovy'`

---

### Jenkinsfile.quarkus-base-example
**Size**: ~200 lines
**Purpose**: Complete working pipeline implementation
**Contains**:
- Initialize stage (version determination)
- Validate stage (prerequisites check)
- Build Docker Image stage
- Tag Docker Image stage
- Test Docker Image stage
- Push Docker Image stage
- Create Release Tag stage
- Post-build actions

**Usage**: Reference for implementing in your Jenkinsfile

---

### VERSIONING_STRATEGY.md
**Size**: ~1000 lines
**Purpose**: Comprehensive documentation
**Sections**:
1. Version Determination Strategy (four-tier approach)
2. Semantic Versioning Format
3. Tag Naming Convention
4. Implementation Guide (step-by-step)
5. Developer Workflow (how to create releases)
6. Testing Strategy (local and CI testing)
7. Troubleshooting (common issues and solutions)
8. Best Practices

**Usage**: Read when you need detailed information or troubleshooting help

---

### VERSION_STRATEGY_SUMMARY.md
**Size**: ~400 lines
**Purpose**: Executive summary and quick implementation
**Contains**:
- Solution architecture overview
- Implementation steps (concise)
- Usage examples
- Integration guide
- Implementation checklist
- Quick troubleshooting

**Usage**: Read when implementing the solution in Jenkins

---

### QUICK_START.md
**Size**: ~150 lines
**Purpose**: Quick reference for developers and admins
**Contains**:
- How to create a release (simple method)
- How to test version locally
- Development workflow
- Version format examples
- Common commands
- Quick troubleshooting

**Usage**: Share with team for daily operations

---

### VERSION_STRATEGY_README.md
**Size**: ~350 lines
**Purpose**: Main entry point and overview
**Contains**:
- What this solution is
- What you get
- How it works
- Key features
- Integration example
- Common use cases
- Testing before deployment
- Benefits summary

**Usage**: Start here to understand the complete solution

---

### test-version-strategy.sh
**Size**: ~200 lines
**Purpose**: Bash script for local testing
**Contains**:
- Version determination simulation
- Test for exact tag
- Test for latest tag + increment
- Test for initial version
- Diagnostic information output

**Usage**: Run locally to test version determination before Jenkins build

---

## Reading Guide

### For Developers

1. **First time**: Read VERSION_STRATEGY_README.md
2. **Daily use**: Keep QUICK_START.md handy
3. **Creating releases**: Follow QUICK_START.md instructions
4. **Troubleshooting**: Check VERSIONING_STRATEGY.md troubleshooting section

### For Jenkins Admins

1. **Understanding solution**: Read VERSION_STRATEGY_README.md
2. **Implementation**: Follow VERSION_STRATEGY_SUMMARY.md checklist
3. **Pipeline setup**: Reference Jenkinsfile.quarkus-base-example
4. **Testing**: Run test-version-strategy.sh locally first
5. **Detailed docs**: Read VERSIONING_STRATEGY.md for complete information

### For Team Leads

1. **Overview**: Read VERSION_STRATEGY_README.md
2. **Benefits**: Check "Benefits Summary" section
3. **Implementation effort**: Review VERSION_STRATEGY_SUMMARY.md checklist
4. **Team training**: Share QUICK_START.md with developers

---

## File Relationships

```
VERSION_STRATEGY_README.md (Start here - overview)
    │
    ├─> QUICK_START.md (Quick reference for daily use)
    │   └─> Common commands and workflows
    │
    ├─> VERSION_STRATEGY_SUMMARY.md (Implementation guide)
    │   ├─> Implementation checklist
    │   └─> Integration examples
    │
    ├─> VERSIONING_STRATEGY.md (Complete documentation)
    │   ├─> Detailed strategies
    │   ├─> Testing procedures
    │   └─> Troubleshooting guide
    │
    ├─> jenkins-version-strategy.groovy (Core library)
    │   └─> All versioning functions
    │
    ├─> Jenkinsfile.quarkus-base-example (Pipeline)
    │   └─> Complete implementation
    │
    └─> test-version-strategy.sh (Testing)
        └─> Local testing capability
```

---

## Integration Flow

```
1. Read VERSION_STRATEGY_README.md
   ↓
2. Run test-version-strategy.sh (local test)
   ↓
3. Copy jenkins-version-strategy.groovy to repo
   ↓
4. Update Jenkinsfile (reference example)
   ↓
5. Configure Jenkins credentials
   ↓
6. Test build in Jenkins
   ↓
7. Share QUICK_START.md with team
   ↓
8. Use VERSIONING_STRATEGY.md for troubleshooting
```

---

## Key Concepts Across Files

### Four-Tier Strategy (All docs)
1. Exact tag → Release version
2. Latest tag + increment → Development version
3. No tags → Initial version
4. Error → Fallback version

### Version Formats (All docs)
- Release: `X.Y.Z`
- Development: `X.Y.Z-dev.BUILD.COMMIT`
- Initial: `0.1.0-dev.BUILD.COMMIT`
- Fallback: `0.0.0-TIMESTAMP.BUILD.COMMIT`

### Git Tag Pattern (All docs)
- Format: `{prefix}{version}`
- Example: `quarkus-base-v1.2.3`
- Must be semantic version

---

## File Sizes and Complexity

| File | Lines | Complexity | Read Time |
|------|-------|------------|-----------|
| jenkins-version-strategy.groovy | ~500 | Medium | 30 min |
| Jenkinsfile.quarkus-base-example | ~200 | Medium | 15 min |
| VERSIONING_STRATEGY.md | ~1000 | Low | 45 min |
| VERSION_STRATEGY_SUMMARY.md | ~400 | Low | 20 min |
| QUICK_START.md | ~150 | Low | 10 min |
| VERSION_STRATEGY_README.md | ~350 | Low | 20 min |
| test-version-strategy.sh | ~200 | Low | 15 min |

---

## Next Steps

1. ✅ You are here (INDEX.md)
2. → Read VERSION_STRATEGY_README.md
3. → Run test-version-strategy.sh
4. → Follow VERSION_STRATEGY_SUMMARY.md checklist
5. → Implement in Jenkins
6. → Share QUICK_START.md with team

---

## All Files at a Glance

```
testing/
├── INDEX.md (this file)
├── VERSION_STRATEGY_README.md (start here)
├── QUICK_START.md (daily reference)
├── VERSION_STRATEGY_SUMMARY.md (implementation guide)
├── VERSIONING_STRATEGY.md (complete docs)
├── jenkins-version-strategy.groovy (core library)
├── Jenkinsfile.quarkus-base-example (pipeline example)
└── test-version-strategy.sh (testing script)
```

---

**Total Documentation**: ~3000 lines
**Total Code**: ~700 lines
**Status**: Production Ready
**Date**: 2025-01-04
