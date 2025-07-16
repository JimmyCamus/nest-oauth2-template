export const validate = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const errorMessages: string[] = [];
  if (!config) {
    errorMessages.push('Configuration is required');
  }

  const enabledProviders =
    config['OAUTH_PROVIDERS']?.toString().split(',') || [];

  for (const provider of enabledProviders) {
    const clientId = config[`${provider}_CLIENT_ID`];
    const clientSecret = config[`${provider}_CLIENT_SECRET`];
    const callbackUrl = config[`${provider}_CALLBACK_URL`];

    if (!clientId || !clientSecret || !callbackUrl) {
      errorMessages.push(
        `${provider} OAuth configuration is incomplete. Please check your environment variables.`,
      );
    }
  }

  const dbPort = config['DATABASE_PORT'];
  const dbHost = config['DATABASE_HOST'];
  const dbUsername = config['DATABASE_USER'];
  const dbPassword = config['DATABASE_PASSWORD'];
  const dbName = config['DATABASE_NAME'];

  if (!dbPort || !dbHost || !dbUsername || !dbPassword || !dbName) {
    errorMessages.push(
      'Database configuration is incomplete. Please check your environment variables.',
    );
  }

  const jwtSecret = config['JWT_SECRET'];

  if (!jwtSecret) {
    errorMessages.push('JWT_SECRET is not set. Please configure it.');
  }

  if (errorMessages.length)
    throw new Error(
      `Configuration validation failed: ${errorMessages.join(', ')}`,
    );

  return config;
};
