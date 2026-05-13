module.exports = {
   preset: 'ts-jest',
   testEnvironment: 'jsdom',
   setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
   testEnvironmentOptions: {
      customExportConditions: ['node', 'node-addons'],
   },
   setupFiles: ['<rootDir>/jest.setup.js'],
   // Configuración de cobertura
   collectCoverage: false,
   coverageDirectory: 'coverage',
   coverageReporters: ['text', 'lcov', 'html'],
   collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.test.{ts,tsx}',
      '!src/**/*.spec.{ts,tsx}',
      '!src/test-utils.tsx',
      '!src/setupTests.ts',
      '!src/main.tsx',
      '!src/vite-env.d.ts',
      '!src/Env.ts',
      '!src/config/env.ts',
      '!src/**/*.config.{ts,js}',
   ],
   coveragePathIgnorePatterns: [
      '/node_modules/',
      'src/Env.ts',
      'src/config/env.ts',
      'src/main.tsx',
      'src/vite-env.d.ts',
      'src/setupTests.ts',
      'src/test-utils.tsx',
   ],
   moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
   },
   transform: {
      '^.+\\.(ts|tsx)$': [
         'ts-jest',
         {
            useESM: true,
            tsconfig: {
               jsx: 'react-jsx',
               esModuleInterop: true,
            },
         },
      ],
   },
   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
   testMatch: [
      '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
      '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
   ],
   modulePathIgnorePatterns: ['<rootDir>/dist/'],
   transformIgnorePatterns: ['node_modules/(?!(jose|.*\\.mjs$))'],
   extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
