#!/usr/bin/env node

/**
 * Code complexity checker for vizualni-admin
 * Analyzes TypeScript files for complexity metrics and enforces limits
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxCyclomaticComplexity: 10,
  maxCognitiveComplexity: 15,
  maxFunctionLength: 50,
  maxFileLength: 300,
  exclude: [
    '**/*.d.ts',
    '**/*.stories.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    'node_modules/**',
    'dist/**',
    'coverage/**'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function shouldExclude(filePath) {
  return CONFIG.exclude.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  });
}

function getComplexityMetrics(filePath) {
  try {
    // Use complexity-report if available
    const report = execSync(`npx complexity-report --format json "${filePath}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const data = JSON.parse(report);
    return data.reports[0] || null;
  } catch (error) {
    // Fallback to basic analysis
    return analyzeFileManually(filePath);
  }
}

function analyzeFileManually(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Simple complexity estimation
  const functionMatches = content.match(/function\s+\w+|=>\s*{|\w+\s*:\s*function/g) || [];
  const controlFlowMatches = content.match(/if|else|for|while|switch|case|catch|try|\?[^:]*:/g) || [];

  const functions = functionMatches.map((match, index) => ({
    name: `Function ${index + 1}`,
    complexity: {
      cyclomatic: Math.max(1, controlFlowMatches.length / functionMatches.length),
      cognitive: controlFlowMatches.length
    },
    line: content.substring(0, content.indexOf(match)).split('\n').length,
    length: 0 // Would need more sophisticated parsing
  }));

  return {
    path: filePath,
    functions,
    aggregate: {
      cyclomatic: functions.reduce((sum, fn) => sum + fn.complexity.cyclomatic, 0),
      cognitive: functions.reduce((sum, fn) => sum + fn.complexity.cognitive, 0)
    }
  };
}

function checkFunctionComplexity(func, filePath) {
  const issues = [];

  if (func.complexity.cyclomatic > CONFIG.maxCyclomaticComplexity) {
    issues.push({
      type: 'cyclomatic',
      severity: func.complexity.cyclomatic > CONFIG.maxCyclomaticComplexity * 1.5 ? 'error' : 'warning',
      value: func.complexity.cyclomatic,
      limit: CONFIG.maxCyclomaticComplexity
    });
  }

  if (func.complexity.cognitive > CONFIG.maxCognitiveComplexity) {
    issues.push({
      type: 'cognitive',
      severity: func.complexity.cognitive > CONFIG.maxCognitiveComplexity * 1.5 ? 'error' : 'warning',
      value: func.complexity.cognitive,
      limit: CONFIG.maxCognitiveComplexity
    });
  }

  return issues;
}

function checkFileLength(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;

  if (lines > CONFIG.maxFileLength) {
    return {
      type: 'length',
      severity: lines > CONFIG.maxFileLength * 1.5 ? 'error' : 'warning',
      value: lines,
      limit: CONFIG.maxFileLength
    };
  }

  return null;
}

function analyzeDirectory(dirPath) {
  const files = [];

  function walkDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && !shouldExclude(itemPath)) {
        walkDirectory(itemPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        if (!shouldExclude(itemPath)) {
          files.push(itemPath);
        }
      }
    }
  }

  walkDirectory(dirPath);
  return files;
}

function main() {
  const srcPath = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcPath)) {
    colorLog('red', '❌ src directory not found');
    process.exit(1);
  }

  colorLog('blue', '🔍 Analyzing code complexity...');
  console.log('');

  const files = analyzeDirectory(srcPath);
  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const filePath of files) {
    try {
      const metrics = getComplexityMetrics(filePath);

      if (!metrics) continue;

      let fileIssues = 0;

      // Check individual functions
      for (const func of metrics.functions || []) {
        const issues = checkFunctionComplexity(func, filePath);

        for (const issue of issues) {
          fileIssues++;
          totalIssues++;

          if (issue.severity === 'error') {
            errorCount++;
          } else {
            warningCount++;
          }

          const severityColor = issue.severity === 'error' ? 'red' : 'yellow';
          const severityIcon = issue.severity === 'error' ? '❌' : '⚠️';

          colorLog(severityColor, `${severityIcon} ${path.relative(process.cwd(), filePath)}:${func.line || '?'} - ${func.name}`);
          console.log(`   ${issue.type} complexity: ${issue.value} (limit: ${issue.limit})`);
        }
      }

      // Check file length
      const lengthIssue = checkFileLength(filePath);
      if (lengthIssue) {
        fileIssues++;
        totalIssues++;

        if (lengthIssue.severity === 'error') {
          errorCount++;
        } else {
          warningCount++;
        }

        const severityColor = lengthIssue.severity === 'error' ? 'red' : 'yellow';
        const severityIcon = lengthIssue.severity === 'error' ? '❌' : '⚠️';

        colorLog(severityColor, `${severityIcon} ${path.relative(process.cwd(), filePath)} - File length`);
        console.log(`   ${lengthIssue.value} lines (limit: ${lengthIssue.limit})`);
      }

    } catch (error) {
      console.log(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    }
  }

  console.log('');
  colorLog('blue', '📊 Complexity Analysis Summary:');
  console.log(`  Files analyzed: ${files.length}`);
  console.log(`  Total issues: ${totalIssues}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Warnings: ${warningCount}`);

  if (errorCount > 0) {
    console.log('');
    colorLog('red', '❌ Complexity check failed with errors');
    console.log('');
    console.log('💡 Recommendations:');
    console.log('  • Break down complex functions into smaller, more focused functions');
    console.log('  • Extract complex logic into separate utilities');
    console.log('  • Use early returns to reduce nesting');
    console.log('  • Consider using the Strategy pattern for complex conditional logic');
    console.log('  • Split large files into smaller, more focused modules');

    process.exit(1);
  } else if (warningCount > 0) {
    console.log('');
    colorLog('yellow', '⚠️ Complexity check passed with warnings');
  } else {
    console.log('');
    colorLog('green', '✅ Complexity check passed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };