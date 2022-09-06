module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/integration-tests/*.test.ts'],
  setupFilesAfterEnv: ['./integration-tests/jest.setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/integration-tests/tsconfig.json',
    },
  },
}
