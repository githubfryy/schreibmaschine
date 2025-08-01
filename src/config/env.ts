import { z } from 'zod';

// Environment Schema with Zod for Runtime Validation
const envSchema = z.object({
  // Server Configuration
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_PATH: z.string().default('./data/schreibmaschine.db'),
  DATABASE_BACKUP_PATH: z.string().default('./data/backups/'),

  // Admin Authentication
  ADMIN_PASSWORD: z.string().min(8).default('schreibmaschine2025!'),

  // Session Management
  SESSION_SECRET: z.string().min(32).default('your-super-secret-session-key-change-in-production'),
  SESSION_MAX_AGE: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 days

  // Real-time Features
  SSE_HEARTBEAT_INTERVAL: z.coerce.number().default(30000), // 30 seconds
  ONLINE_STATUS_TIMEOUT: z.coerce.number().default(60000), // 1 minute

  // Feature Flags
  FEATURE_ADMIN_DASHBOARD: z.coerce.boolean().default(true),
  FEATURE_EXPORT_MARKDOWN: z.coerce.boolean().default(true),
  FEATURE_ACTIVITY_SYSTEM: z.coerce.boolean().default(true),

  // Development
  DEV_SEED_DATABASE: z.coerce.boolean().default(false),
  DEV_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Inferred Type from Schema
export type EnvConfig = z.infer<typeof envSchema>;

// Parse and validate environment
const parseEnv = (): EnvConfig => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
    }
    process.exit(1);
  }
};

// Export type-safe environment config
export const env = parseEnv();

// Type-safe feature flag checking
export const isFeatureEnabled = (
  feature: keyof Pick<
    EnvConfig,
    'FEATURE_ADMIN_DASHBOARD' | 'FEATURE_EXPORT_MARKDOWN' | 'FEATURE_ACTIVITY_SYSTEM'
  >
): boolean => {
  return env[feature] as boolean;
};

// Development helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Logging configuration
export const shouldLog = (level: EnvConfig['DEV_LOG_LEVEL']): boolean => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevel = levels.indexOf(env.DEV_LOG_LEVEL);
  const requestedLevel = levels.indexOf(level);
  return requestedLevel >= currentLevel;
};
