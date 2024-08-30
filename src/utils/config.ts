type EnvValue = 'SECRET_TOKEN' | 'TABLE_NAME' | 'BOT_TOKEN';

export function getEnvValue(value: EnvValue): string {
  const environmentValue = process.env[value];
  // if (!environmentValue) {
  //   throw new Error(`Environment value ${value} is not defined`);
  // }

  return environmentValue!;
}
