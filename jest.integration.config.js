/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Only the real-LAN integration tests. These talk to live Daikin units over
    // UDP discovery and HTTP, so they need to run on the home network.
    testMatch: ['**/test/integration/**/*.test.ts'],
};
