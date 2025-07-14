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

  if (errorMessages.length)
    throw new Error(
      `Configuration validation failed: ${errorMessages.join(', ')}`,
    );

  return config;
};
