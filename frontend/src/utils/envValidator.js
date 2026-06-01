/**
 * Environment Variable Validator - Frontend
 * Checks for required env variables and provides helpful error messages
 * MongoDB backend with JWT auth (Supabase removed)
 */

const REQUIRED_ENV_VARS = {
  // Formspree endpoint for contact forms (optional override)
  VITE_FORMSPREE_ENDPOINT: {
    label: "Formspree Endpoint",
    required: false,
    description: "Formspree form endpoint for contact form submissions",
  },
  VITE_NODE_ENV: {
    label: "Node Environment",
    required: true,
    description: "Node environment (e.g., development, production)",
  },
};

/**
 * Check if all required environment variables are set
 * @returns {Object} { isValid: boolean, errors: string[], warnings: string[] }
 */
export const validateEnvironmentVariables = () => {
  const errors = [];
  const warnings = [];

  Object.entries(REQUIRED_ENV_VARS).forEach(([varName, config]) => {
    const value = import.meta.env[varName];

    if (!value || value.startsWith("your_")) {
      if (config.allowMissingInProd && import.meta.env.PROD) {
        return;
      }

      const message = config.errorMessage
        ? `${config.label}: ${config.errorMessage}`
        : `Missing or invalid ${config.label}: ${config.description}`;

      if (config.required) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
      return;
    }

    // Custom validation if provided
    if (config.validate && !config.validate(value)) {
      const message = config.errorMessage
        ? `${config.label}: ${config.errorMessage}`
        : `Invalid ${config.label}: ${config.description}`;

      if (config.required) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Print environment validation results to console
 */
export const printEnvValidation = () => {
  const validation = validateEnvironmentVariables();

  if (validation.errors.length > 0) {
    console.error("❌ ENVIRONMENT VARIABLES MISSING:");
    validation.errors.forEach((err) => console.error(`   • ${err}`));
  }

  if (validation.warnings.length > 0) {
    console.warn("⚠️  OPTIONAL ENVIRONMENT VARIABLES NOT CONFIGURED:");
    validation.warnings.forEach((warn) => console.warn(`   • ${warn}`));
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    console.log("✅ All required environment variables are configured");
  }

  return validation;
};

/**
 * Get a specific environment variable with fallback
 * @param {string} varName - Environment variable name
 * @param {*} fallback - Fallback value if not found
 * @returns {*} The environment variable value or fallback
 */
export const getEnvVar = (varName, fallback = null) => {
  const value = import.meta.env[varName];
  return value || fallback;
};

/**
 * Show environment configuration status in UI
 * Useful for development/debugging
 */
export const showEnvConfig = () => {
  const validation = validateEnvironmentVariables();

  return {
    isConfigured: validation.isValid,
    status: validation.isValid ? "READY" : "INCOMPLETE",
    missingCount: validation.errors.length,
    warningCount: validation.warnings.length,
  };
};

export default {
  validateEnvironmentVariables,
  printEnvValidation,
  getEnvVar,
  showEnvConfig,
};
