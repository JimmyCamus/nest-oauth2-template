export const validate = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const errorMessages: string[] = [];
  if (!config) {
    errorMessages.push('Configuration is required');
  }

  const clientId = config['GOOGLE_CLIENT_ID'];
  const clientSecret = config['GOOGLE_CLIENT_SECRET'];
  const callbackUrl = config['GOOGLE_CALLBACK_URL'];

  if (!clientId || !clientSecret || !callbackUrl) {
    errorMessages.push(
      'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL must be set',
    );
  }

  if (errorMessages.length)
    throw new Error(
      `Configuration validation failed: ${errorMessages.join(', ')}`,
    );

  return config;
};
