/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^.+.module.css$': '<rootDir>/src/test/style-mock.cjs',
    '^.+.css$': '<rootDir>/src/test/style-mock.cjs',
    '^.+.svg$': '<rootDir>/src/test/file-mock.cjs',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
