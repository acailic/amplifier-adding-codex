import crypto from 'crypto';

// Generate a secure random key for development if needed
function generateSecureKey(length = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

// Validate environment variables and provide clear error messages
function validateEnvironmentVariable(name: string, required: boolean = true): string {
  const value = process.env[name];
  
  if (required && (!value || value.trim() === '')) {
    throw new Error(`\n🚨 SECURITY ERROR: Required environment variable '${name}' is missing or empty.\n` +
      `Please set this environment variable before starting the application.\n` +
      `For development, add it to your .env file.\n` +
      `For production, ensure it's properly configured in your hosting environment.\n`);
  }
  
  // Check for weak/default values that should be replaced in production
  if (value && process.env.NODE_ENV === 'production') {
    const weakPatterns = [
      'your-super-secret',
      'your-secret-key',
      'default-secret',
      'change-me',
      'your-secret-jwt-key',
      'test-key',
      'dev-key'
    ];
    
    if (weakPatterns.some(pattern => value.toLowerCase().includes(pattern))) {
      throw new Error(`\n🚨 SECURITY ERROR: Environment variable '${name}' appears to be using a weak/default value.\n` +
        `This is not secure for production. Please generate a strong, unique secret.\n` +
        `You can generate one using: openssl rand -base64 64\n`);
    }
  }
  
  return value || '';
}

export const config = {
  // Database - Required with validation
  supabaseUrl: validateEnvironmentVariable('SUPABASE_URL'),
  supabaseServiceKey: validateEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY'),

  // Stripe - Required for payment processing
  stripeSecretKey: validateEnvironmentVariable('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: validateEnvironmentVariable('STRIPE_WEBHOOK_SECRET'),

  // Redis - Required for production rate limiting
  redisUrl: process.env.REDIS_URL || (process.env.NODE_ENV === 'production' ? '' : 'redis://localhost:6379'),
  redisPassword: process.env.REDIS_PASSWORD || '',

  // GitHub - Required for repository analysis
  githubToken: validateEnvironmentVariable('GITHUB_TOKEN'),

  // App URLs - Required for proper functioning
  appUrl: validateEnvironmentVariable('NEXT_PUBLIC_APP_URL'),
  apiUrl: validateEnvironmentVariable('API_URL'),

  // JWT - No defaults, must be explicitly set
  jwtSecret: validateEnvironmentVariable('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Rate limiting - Configurable with secure defaults
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Upload security - Validated file size and types
  maxFileSize: Math.min(
    parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    50 * 1024 * 1024 // Hard cap at 50MB
  ),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 
    'image/jpeg,image/png,image/svg+xml,application/pdf,image/webp').split(',').map(t => t.trim()),

  // Email configuration - Optional but recommended
  emailFrom: process.env.EMAIL_FROM || 'noreply@devbirthchart.com',
  smtpUrl: process.env.SMTP_URL || '', // Empty string will disable email features

  // Analytics - Optional
  analyticsApiKey: process.env.ANALYTICS_API_KEY || '',

  // Feature flags - Defaults to off for security
  enableTeamFeatures: process.env.ENABLE_TEAM_FEATURES === 'true',
  enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
  enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
  enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true', // Separate debug flag

  // Security settings
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000'), // 7 days
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  
  // CORS settings
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    [],

  // Development vs Production detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

// Enhanced validation function
export function validateConfig(): void {
  console.log('🔒 Validating security configuration...\n');
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY', 
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];

  const warnings: string[] = [];
  
  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName]!.trim() === '') {
      throw new Error(`❌ CRITICAL: Required environment variable '${varName}' is missing or empty.`);
    }
  }

  // Security-specific validations
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error(`❌ INSECURE: JWT_SECRET must be at least 32 characters long. Current length: ${jwtSecret.length}`);
  }

  if (jwtSecret.includes('your-super-secret') || jwtSecret.includes('your-secret-key')) {
    throw new Error('❌ INSECURE: JWT_SECRET is using a weak/default value. Please generate a strong secret.');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REDIS_URL) {
      warnings.push('⚠️  WARNING: REDIS_URL not configured. Rate limiting will use in-memory store (not recommended for production).');
    }

    if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('http://')) {
      warnings.push('⚠️  WARNING: Using HTTP for NEXT_PUBLIC_APP_URL in production. Please use HTTPS.');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('❌ CRITICAL: STRIPE_WEBHOOK_SECRET required in production for webhook security.');
    }

    // Check for weak passwords/secrets
    const weakPatterns = ['password', 'secret', 'admin', 'test', 'dev'];
    const envKeys = Object.keys(process.env);
    
    for (const key of envKeys) {
      if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
        const value = process.env[key];
        if (value && weakPatterns.some(pattern => value.toLowerCase().includes(pattern))) {
          warnings.push(`⚠️  WARNING: ${key} appears to contain a weak value. Please review.`);
        }
      }
    }
  }

  // Development-specific validations
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
    console.log('ℹ️  INFO: No Redis URL configured for development. Using in-memory rate limiting.');
  }

  // Display warnings if any
  if (warnings.length > 0) {
    console.log('\n⚠️  Security Warnings:');
    warnings.forEach(warning => console.log(warning));
    console.log();
  }

  console.log('✅ Security configuration validated successfully!\n');
}

// Utility function to generate secrets for development setup
export function generateSecrets(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.log('❌ This function should only be used in development environment.');
    return;
  }

  console.log('🔧 Generating development secrets:\n');
  
  const secrets = {
    JWT_SECRET: generateSecureKey(64),
    STRIPE_WEBHOOK_SECRET: generateSecureKey(32),
    SESSION_SECRET: generateSecureKey(64),
  };

  console.log('Add these to your .env file:\n');
  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  console.log('\n⚠️  Remember to replace these with production secrets when deploying!\n');
}

// Validate configuration on import
if (process.env.NODE_ENV !== 'test') {
  try {
    validateConfig();
  } catch (error) {
    console.error('\n🚨 SECURITY VALIDATION FAILED:');
    console.error(error.message);
    console.error('\nPlease fix the above issues before starting the application.');
    process.exit(1);
  }
}
