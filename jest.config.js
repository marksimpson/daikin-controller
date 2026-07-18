/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Real-network tests live in test/integration and are opt-in via
    // `npm run test:integration`; the default run stays hermetic.
    testPathIgnorePatterns: ['/node_modules/', '/test/integration/'],
};
