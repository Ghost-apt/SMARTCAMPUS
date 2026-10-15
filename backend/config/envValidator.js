/**
 * SmartCampus AI — Environment Configuration Validator
 * Validates required environment variables and enforces production security defaults.
 */

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // Required environment variables
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // JWT Secret strength validation
  const jwtSecret = process.env.JWT_SECRET || '';
  if (isProduction && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long in production mode for cryptographic security.');
  } else if (!isProduction && jwtSecret.length < 16) {
    warnings.push('JWT_SECRET is relatively short (<16 chars). Recommended: >=32 chars.');
  }

  // Port validation
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT configuration: "${process.env.PORT}". Must be an integer between 1 and 65535.`);
  }

  // Internal AI Secret Key check
  if (!process.env.INTERNAL_AI_KEY) {
    warnings.push('INTERNAL_AI_KEY is not explicitly set; defaulting to fallback internal key.');
  }

  // AI Microservice URL check
  if (!process.env.AI_SERVICE_URL) {
    warnings.push('AI_SERVICE_URL is not set; defaulting to http://127.0.0.1:8000.');
  }

  // Report results
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  [EnvValidator Warnings]:\n' + warnings.map((w) => `   - ${w}`).join('\n'));
  }

  if (errors.length > 0) {
    const errorMsg = '❌ [EnvValidator Fatal Errors]:\n' + errors.map((e) => `   - ${e}`).join('\n');
    console.error(errorMsg);
    if (isProduction) {
      throw new Error(errorMsg);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedConfig: {
      port,
      environment: process.env.NODE_ENV || 'development',
      mongoUriConfigured: !!process.env.MONGODB_URI,
      jwtConfigured: !!process.env.JWT_SECRET,
      aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
      clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
    }
  };
};

module.exports = { validateEnv };
