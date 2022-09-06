module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/ts_src/**/*.test.ts'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
