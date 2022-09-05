/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import { Config } from 'jest'

export default {
  preset: 'ts-jest',
  clearMocks: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/core/**/*.ts',
    'src/api/routes/*.ts',
    'src/database/repositories/*.ts',
    'src/cache/*-repository.ts',
    '!src/**/index.ts'
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/tests/', '<rootDir>/database/repositories/index.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  testTimeout: 60000
} as Config
