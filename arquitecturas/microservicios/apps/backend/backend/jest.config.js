module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.js'], // Archivo que preparará la BD antes de cada test
  clearMocks: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'], // Buscará cualquier archivo que termine en .test.js dentro de /tests
};