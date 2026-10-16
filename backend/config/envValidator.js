/**
 * SmartCampus AI — Environment Configuration Validator
 * Validates required environment variables and enforces production security defaults.
 */

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // 1. MONGODB_URI validation & healing
  if (process.env.MONGODB_URI) {
    let uri = process.env.MONGODB_URI.trim();

    // Check for unreplaced Atlas template placeholder
    if (/<(password|db_password)>/i.test(uri)) {
      errors.push('MONGODB_URI contains unreplaced Atlas placeholder "<password>". Replace it with your actual database user password.');
    } else if (/<([^>]+)>/.test(uri)) {
      // User left literal angle brackets around password e.g. <mypassword>
      // Strip angle brackets to heal URI
      uri = uri.replace(/<([^>]+)>/g, '$1');
      process.env.MONGODB_URI = uri;
      warnings.push('Stripped accidental angle brackets "<...>" from password in MONGODB_URI.');
    }
  } else {
    if (isProduction) {
      errors.push('Missing required environment variable: MONGODB_URI');
    } else {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/smartcampus';
      warnings.push('MONGODB_URI is not set; defaulting to local MongoDB: mongodb://127.0.0.1:27017/smartcampus');
    }
  }

  // 2. JWT_SECRET validation
  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      errors.push('Missing required environment variable: JWT_SECRET');
    } else {
      process.env.JWT_SECRET = 'smartcampus_dev_jwt_secret_key_2026_minimum_32chars_long';
      warnings.push('JWT_SECRET is not set; using development fallback secret key.');
    }
  } else {
    const jwtSecret = process.env.JWT_SECRET.trim();
    if (isProduction && jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production mode for cryptographic security.');
    } else if (!isProduction && jwtSecret.length < 16) {
      warnings.push('JWT_SECRET is relatively short (<16 chars). Recommended: >=32 chars.');
    }
  }

  // 3. Port validation
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT configuration: "${process.env.PORT}". Must be an integer between 1 and 65535.`);
  }

  // 4. Internal AI Secret Key check
  if (!process.env.INTERNAL_AI_KEY) {
    process.env.INTERNAL_AI_KEY = 'smartcampus-internal-ai-secret-key-2026';
    warnings.push('INTERNAL_AI_KEY is not set; defaulting to standard internal key.');
  }

  // 5. AI Microservice URL check
  if (!process.env.AI_SERVICE_URL) {
    process.env.AI_SERVICE_URL = 'http://127.0.0.1:8000';
    warnings.push('AI_SERVICE_URL is not set; defaulting to http://127.0.0.1:8000.');
  }

  // 6. Client Origin check
  if (!process.env.CLIENT_ORIGIN) {
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
  }

  // Report results
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  [EnvValidator Notice]:\n' + warnings.map((w) => `   - ${w}`).join('\n'));
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
      aiServiceUrl: process.env.AI_SERVICE_URL,
      clientOrigin: process.env.CLIENT_ORIGIN
    }
  };
};

module.exports = { validateEnv };
