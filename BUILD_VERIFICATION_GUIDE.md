# Build Verification Guide

This guide explains how to use the build verification system for vizualni-admin to ensure builds work locally before pushing to main branch.

## Overview

The build verification system consists of:
1. **Build Verification Script** (`verify-build.sh`) - Tests the local build process
2. **Pre-push Git Hook** (`.git/hooks/pre-push`) - Automatically runs verification before pushes to main
3. **Manual Testing** - Run verification anytime you want to check build status

## Usage

### Manual Build Verification

Run the verification script manually:

```bash
./verify-build.sh
```

This will:
- ✅ Check if dependencies are installed
- ✅ Install dependencies if needed (with `--legacy-peer-deps`)
- ✅ Clean previous build artifacts
- ✅ Test JavaScript build (using `npx tsup --no-dts`)
- ✅ Verify build artifacts are created
- ⚠️ Test TypeScript declarations (known to fail)
- 🔍 Run basic type checking
- 📋 Provide detailed status report

### Automatic Pre-push Verification

The pre-push hook automatically runs build verification when pushing to main:

```bash
git push origin main
```

**What happens:**
- If pushing to main branch: Runs build verification
- If verification passes: Push proceeds normally
- If verification fails: Push is blocked with error message

**Push to other branches** (feature, develop, etc.): Verification is skipped.

### Skipping Verification (Emergency)

In emergency situations, you can bypass the pre-push hook:

```bash
git push origin main --no-verify
```

⚠️ **Warning:** Only use this in emergencies! This pushes broken code to main.

## Build Status

### Current Status

- **JavaScript Build**: ✅ Working
- **TypeScript Declarations**: ❌ Known issues with sourcemap resolution
- **Type Checking**: ⚠️ Many errors but core functionality works
- **Dependencies**: ✅ Install with `--legacy-peer-deps`

### Known Issues

1. **TypeScript Declaration Generation**: Fails due to sourcemap resolution issues
   - **Workaround**: Use `npx tsup --no-dts` for JavaScript-only builds
   - **Impact**: No type definitions generated, but JavaScript works correctly

2. **Dependency Conflicts**: Requires `--legacy-peer-deps` flag
   - **Root Cause**: React version conflicts with @mdx-js/react
   - **Status**: Handled automatically by verification script

3. **Type Errors**: Many TypeScript errors in charts and map components
   - **Root Cause**: Large codebase with evolving type definitions
   - **Impact**: Type checking fails, but runtime functionality works

## Build Verification Script Details

### What it Tests

1. **Directory Check**: Ensures vizualni-admin directory exists
2. **Dependencies**: Checks and installs npm dependencies
3. **JavaScript Build**: Core build process using tsup
4. **Build Artifacts**: Verifies `dist/index.js` and `dist/index.mjs` are created
5. **TypeScript Declarations**: Tests DTS generation (known to fail)
6. **Type Checking**: Runs basic TypeScript compiler check

### Success Indicators

✅ **Dependencies installed successfully**
✅ **JavaScript build succeeded!**
✅ **Build artifacts created successfully**
✅ **Build verification completed successfully!**

### Warning Indicators

⚠️ **TypeScript declaration generation failed (known issue)**
⚠️ **Type checking had issues, but build works**

### Error Indicators

❌ **Failed to install dependencies**
❌ **JavaScript build failed**
❌ **Build artifacts not found**

## Troubleshooting

### Common Issues

1. **Dependencies Won't Install**
   ```bash
   cd ai_working/vizualni-admin/app
   npm install --legacy-peer-deps
   ```

2. **Build Fails Clean**
   ```bash
   cd ai_working/vizualni-admin/app
   rm -rf dist/ node_modules/
   npm install --legacy-peer-deps
   npx tsup --no-dts
   ```

3. **Pre-push Hook Not Running**
   ```bash
   chmod +x .git/hooks/pre-push
   ```

4. **Verification Script Not Found**
   ```bash
   # Make sure you're in project root
   ls -la verify-build.sh
   chmod +x verify-build.sh
   ```

### Getting Help

1. **Check the logs**: Run verification manually to see detailed output
2. **Clean build**: Remove `dist/` and `node_modules/` and retry
3. **Check dependencies**: Ensure all npm packages are properly installed
4. **Verify git hooks**: Make sure pre-push hook is executable

## Best Practices

### Before Pushing to Main

1. **Run manual verification**: `./verify-build.sh`
2. **Fix any JavaScript build errors** before pushing
3. **Commit working code**: Don't push broken builds
4. **Check output**: Review verification script output for warnings

### Development Workflow

1. **Make changes**: Work on your feature or fix
2. **Test locally**: Run `./verify-build.sh` manually
3. **Fix issues**: Address any build problems
4. **Push to main**: Use normal `git push` (automatic verification)
5. **Monitor CI**: Check that CI/CD pipeline passes

### Code Review

When reviewing PRs that will be merged to main:
- ✅ Verify JavaScript builds work
- ✅ Check for new dependency conflicts
- ✅ Ensure verification script passes
- ✅ Consider TypeScript errors (may be acceptable)

## Files

- `verify-build.sh` - Main build verification script
- `.git/hooks/pre-push` - Pre-push git hook
- `ai_working/vizualni-admin/app/` - vizualni-admin application
- `ai_working/vizualni-admin/app/package.json` - Package configuration
- `ai_working/vizualni-admin/app/tsup.config.ts` - Build configuration

## Future Improvements

1. **Fix TypeScript Declaration Generation**: Resolve sourcemap issues
2. **Improve Type Checking**: Fix TypeScript errors gradually
3. **Dependency Resolution**: Clean up peer dependency conflicts
4. **CI Integration**: Add build verification to CI pipeline
5. **Performance**: Optimize build speed and artifact size