module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/*.test.ts'],
    setupFilesAfterEnv: ['./jest.setup.js'],
    coverageDirectory: './coverage/',
};
