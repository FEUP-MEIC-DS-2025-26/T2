const { createDefaultPreset } = require('ts-jest');
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  roots: ['<rootDir>/apps/mips_product_page/src'],

  testMatch: ['**/__tests__/**/*.test.ts?(x)'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  moduleNameMapper: {
    '^react$':
      '<rootDir>/apps/mips_product_page/node_modules/react',
    '^react-dom$':
      '<rootDir>/apps/mips_product_page/node_modules/react-dom',
    '^react-dom/client$':
      '<rootDir>/apps/mips_product_page/node_modules/react-dom/client',
    '^react/jsx-runtime$':
      '<rootDir>/apps/mips_product_page/node_modules/react/jsx-runtime',

      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  setupFilesAfterEnv: ['@testing-library/jest-dom'],

  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: false,
      },
    ],
  },
};
