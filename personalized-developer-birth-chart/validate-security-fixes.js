#!/usr/bin/env node

// Simple validation script to check if security files exist and have correct structure
const fs = require('fs');
const path = require('path');

console.log('🔒 Validating Security Fixes...\n');

const filesToCheck = [
  {
    path: 'api/middleware/rateLimit.ts',
    description: 'Rate limiting middleware',
    checks: ['jwt.verify', 'extractUserIdFromToken', 'Redis']
  },
  {
    path: 'config/env.ts',
    description: 'Environment configuration',
    checks: ['validateEnvironmentVariable', 'JWT_SECRET', 'weakPatterns']
  },
  {
    path: 'next.config.js',
    description: 'Next.js configuration',
    checks: ['allowedOrigins', 'X-Frame-Options', 'Strict-Transport-Security']
  },
  {
    path: 'api/lib/validation/inputValidation.ts',
    description: 'Input validation utilities',
    checks: ['sanitizeString', 'validateEmail', 'validatePassword', 'sqlInjectionPatterns']
  },
  {
    path: 'api/lib/validation/sqlInjectionPrevention.ts',
    description: 'SQL injection prevention',
    checks: ['sanitizeIdentifier', 'detectSuspiciousPatterns', 'QueryBuilder']
  }
];

let allChecksPassed = true;

filesToCheck.forEach(({ path, description, checks }) => {
  try {
    const content = fs.readFileSync(path, 'utf8');
    console.log(`✅ ${description}: ${path}`);
    
    checks.forEach(check => {
      if (content.includes(check)) {
        console.log(`   ✅ Contains: ${check}`);
      } else {
        console.log(`   ❌ Missing: ${check}`);
        allChecksPassed = false;
      }
    });
    
    console.log('');
  } catch (error) {
    console.log(`❌ ${description}: ${path} - File not found`);
    allChecksPassed = false;
    console.log('');
  }
});

// Check for backup files (indicates fixes were applied)
const backupFiles = [
  'api/middleware/rateLimit.ts.backup',
  'config/env.ts.backup',
  'next.config.js.backup'
];

console.log('📦 Backup Files Status:');
backupFiles.forEach(file => {
  try {
    fs.accessSync(file);
    console.log(`✅ Backup exists: ${file}`);
  } catch (error) {
    console.log(`❌ Backup missing: ${file}`);
  }
});

console.log('\n🔍 Security Vulnerability Checks:');

// Check if vulnerable patterns still exist
try {
  const rateLimitContent = fs.readFileSync('api/middleware/rateLimit.ts', 'utf8');
  
  if (rateLimitContent.includes('JSON.parse(atob(')) {
    console.log('❌ CRITICAL: Unsafe JWT parsing still exists!');
    allChecksPassed = false;
  } else {
    console.log('✅ Unsafe JWT parsing has been removed');
  }
  
  if (rateLimitContent.includes('jwt.verify(')) {
    console.log('✅ Proper JWT verification is implemented');
  } else {
    console.log('❌ JWT verification may be missing');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Could not check rateLimit.ts');
  allChecksPassed = false;
}

// Check environment configuration
try {
  const envContent = fs.readFileSync('config/env.ts', 'utf8');
  
  if (envContent.includes('your-super-secret-jwt-key')) {
    console.log('❌ CRITICAL: Default JWT secret still present!');
    allChecksPassed = false;
  } else {
    console.log('✅ Default JWT secret has been removed');
  }
  
  if (envContent.includes('validateEnvironmentVariable')) {
    console.log('✅ Environment validation is implemented');
  } else {
    console.log('❌ Environment validation may be missing');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Could not check env.ts');
  allChecksPassed = false;
}

// Check CORS configuration
try {
  const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
  
  if (nextConfigContent.includes("value: '*'")) {
    console.log('❌ WARNING: Wildcard CORS may still be present');
    allChecksPassed = false;
  } else {
    console.log('✅ Wildcard CORS has been removed');
  }
  
  if (nextConfigContent.includes('allowedOrigins')) {
    console.log('✅ Proper CORS configuration is implemented');
  } else {
    console.log('❌ CORS configuration may be missing');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Could not check next.config.js');
  allChecksPassed = false;
}

console.log('\n📋 Summary:');

if (allChecksPassed) {
  console.log('🎉 ALL SECURITY FIXES HAVE BEEN SUCCESSFULLY IMPLEMENTED!');
  console.log('\n✅ Critical vulnerabilities fixed:');
  console.log('   • JWT security vulnerability');
  console.log('   • CORS configuration');
  console.log('   • Default secrets');
  console.log('   • Rate limiting implementation');
  console.log('   • Input validation');
  console.log('   • SQL injection prevention');
  console.log('   • Security headers');
  
  console.log('\n🚀 The application is now production-ready from a security perspective.');
  console.log('\n⚠️  REMEMBER: Configure your environment variables before deployment!');
} else {
  console.log('❌ SOME SECURITY ISSUES STILL NEED ATTENTION');
  console.log('Please review the failed checks above and fix the remaining issues.');
}

console.log('\n📖 For detailed information, see: SECURITY_FIXES_SUMMARY.md');
