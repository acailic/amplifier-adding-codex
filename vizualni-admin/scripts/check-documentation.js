#!/usr/bin/env node

/**
 * Documentation coverage checker for vizualni-admin
 * Analyzes TypeScript files for documentation completeness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  minDocumentationCoverage: 70, // Minimum percentage of documented exports
  requireJSDocFor: [
    'functions',
    'classes',
    'methods',
    'properties'
  ],
  exclude: [
    '**/*.d.ts',
    '**/*.stories.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/index.ts',
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

function extractExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const exports = {
    functions: [],
    classes: [],
    interfaces: [],
    types: [],
    enums: [],
    constants: []
  };

  // Extract export patterns
  lines.forEach((line, index) => {
    line = line.trim();

    // Export functions
    if (line.match(/^export\s+function\s+\w+/)) {
      const match = line.match(/^export\s+function\s+(\w+)/);
      if (match) {
        exports.functions.push({
          name: match[1],
          line: index + 1,
          documented: false
        });
      }
    }

    // Export arrow functions
    if (line.match(/^export\s+(const|let|var)\s+\w+\s*=/)) {
      const match = line.match(/^export\s+(const|let|var)\s+(\w+)\s*=/);
      if (match) {
        exports.constants.push({
          name: match[2],
          line: index + 1,
          documented: false
        });
      }
    }

    // Export classes
    if (line.match(/^export\s+class\s+\w+/)) {
      const match = line.match(/^export\s+class\s+(\w+)/);
      if (match) {
        exports.classes.push({
          name: match[1],
          line: index + 1,
          documented: false
        });
      }
    }

    // Export interfaces
    if (line.match(/^export\s+interface\s+\w+/)) {
      const match = line.match(/^export\s+interface\s+(\w+)/);
      if (match) {
        exports.interfaces.push({
          name: match[1],
          line: index + 1,
          documented: false
        });
      }
    }

    // Export types
    if (line.match(/^export\s+type\s+\w+/)) {
      const match = line.match(/^export\s+type\s+(\w+)/);
      if (match) {
        exports.types.push({
          name: match[1],
          line: index + 1,
          documented: false
        });
      }
    }

    // Export enums
    if (line.match(/^export\s+enum\s+\w+/)) {
      const match = line.match(/^export\s+enum\s+(\w+)/);
      if (match) {
        exports.enums.push({
          name: match[1],
          line: index + 1,
          documented: false
        });
      }
    }
  });

  return exports;
}

function checkDocumentation(filePath, exports) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check for JSDoc comments before exports
  Object.keys(exports).forEach(type => {
    exports[type].forEach(exp => {
      const lineIndex = exp.line - 1;

      // Check for JSDoc comment above the export
      if (lineIndex > 0) {
        const prevLine = lines[lineIndex - 1].trim();
        const prevPrevLine = lineIndex > 1 ? lines[lineIndex - 2].trim() : '';

        // Check for JSDoc pattern
        if (prevLine === '/**' || (prevLine === '*' && prevPrevLine === '/**')) {
          exp.documented = true;
        }
      }
    });
  });

  return exports;
}

function calculateDocumentationCoverage(exports) {
  let totalItems = 0;
  let documentedItems = 0;

  // Count items that should be documented
  const requireDocFor = CONFIG.requireJSDocFor;

  requireDocFor.forEach(type => {
    if (exports[type]) {
      totalItems += exports[type].length;
      documentedItems += exports[type].filter(item => item.documented).length;
    }
  });

  return {
    total: totalItems,
    documented: documentedItems,
    coverage: totalItems > 0 ? Math.round((documentedItems / totalItems) * 100) : 100
  };
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

function generateDocumentationReport(files) {
  let totalExports = 0;
  let totalDocumented = 0;
  const fileReports = [];

  for (const filePath of files) {
    try {
      const exports = extractExports(filePath);
      const documentedExports = checkDocumentation(filePath, exports);
      const coverage = calculateDocumentationCoverage(documentedExports);

      totalExports += coverage.total;
      totalDocumented += coverage.documented;

      fileReports.push({
        file: path.relative(process.cwd(), filePath),
        exports: documentedExports,
        coverage
      });
    } catch (error) {
      console.log(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    }
  }

  const overallCoverage = totalExports > 0 ? Math.round((totalDocumented / totalExports) * 100) : 100;

  return {
    files: fileReports,
    overall: {
      total: totalExports,
      documented: totalDocumented,
      coverage: overallCoverage
    }
  };
}

function main() {
  const srcPath = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcPath)) {
    colorLog('red', '❌ src directory not found');
    process.exit(1);
  }

  colorLog('blue', '📚 Analyzing documentation coverage...');
  console.log('');

  const files = analyzeDirectory(srcPath);
  const report = generateDocumentationReport(files);

  console.log('📊 Documentation Coverage Report');
  console.log('================================');

  // Display file-level reports
  report.files.forEach(fileReport => {
    const relativePath = fileReport.file;
    const coverage = fileReport.coverage;

    if (coverage.total > 0) {
      const coverageColor = coverage.coverage >= CONFIG.minDocumentationCoverage ? 'green' : 'yellow';
      const coverageIcon = coverage.coverage >= CONFIG.minDocumentationCoverage ? '✅' : '⚠️';

      colorLog(coverageColor, `${coverageIcon} ${relativePath}`);
      console.log(`   Documentation: ${coverage.documented}/${coverage.total} (${coverage.coverage}%)`);

      // Show undocumented items
      const undocumentedItems = [];
      Object.keys(fileReport.exports).forEach(type => {
        const items = fileReport.exports[type].filter(item => !item.documented);
        if (items.length > 0) {
          undocumentedItems.push(...items.map(item => `${type}:${item.name}`));
        }
      });

      if (undocumentedItems.length > 0 && undocumentedItems.length <= 5) {
        console.log(`   Undocumented: ${undocumentedItems.join(', ')}`);
      } else if (undocumentedItems.length > 5) {
        console.log(`   Undocumented: ${undocumentedItems.length} items`);
      }
    }
  });

  console.log('');
  colorLog('blue', '📈 Overall Summary:');
  console.log(`  Files analyzed: ${files.length}`);
  console.log(`  Total exports: ${report.overall.total}`);
  console.log(`  Documented exports: ${report.overall.documented}`);
  console.log(`  Overall coverage: ${report.overall.coverage}%`);

  // Check against threshold
  if (report.overall.coverage < CONFIG.minDocumentationCoverage) {
    console.log('');
    colorLog('yellow', '⚠️ Documentation coverage below threshold');
    console.log(`  Required: ${CONFIG.minDocumentationCoverage}%`);
    console.log(`  Actual: ${report.overall.coverage}%`);
    console.log('');
    console.log('💡 Recommendations:');
    console.log('  • Add JSDoc comments for public APIs');
    console.log('  • Document function parameters and return types');
    console.log('  • Add usage examples for complex components');
    console.log('  • Document component props and their types');
    console.log('  • Include @example blocks in documentation');

    process.exit(1);
  } else {
    console.log('');
    colorLog('green', '✅ Documentation coverage check passed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };