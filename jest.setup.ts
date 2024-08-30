// Mock getEnvValue as it requires  variable to be present
jest.mock('./src/utils/config', () => ({
  ...jest.requireActual('./src/utils/config'),
  getEnvValue: (value: string) => value,
}));
