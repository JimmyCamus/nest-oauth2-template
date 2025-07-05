export const validate = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const errorMessages: string[] = [];
  if (!config) {
    errorMessages.push('Configuration is required');
  }

  if (errorMessages.length)
    throw new Error(
      `Configuration validation failed: ${errorMessages.join(', ')}`,
    );

  return config;
};
