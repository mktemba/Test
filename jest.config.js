/**
 * Jest configuration for Mahjong Learning App
 */
module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Module paths
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/fixtures/'
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Module name mapper for imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg)$': '<rootDir>/tests/mocks/fileMock.js'
  },

  // Globals
  globals: {
    'NODE_ENV': 'test'
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Fake timers
  fakeTimers: {
    enableGlobally: true
  },

  // Max workers for parallel execution
  maxWorkers: '50%'
};