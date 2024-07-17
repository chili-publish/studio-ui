module.exports = {
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/styles.mock.js',
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styles.mock.js',
        '^react($|/.+)': '<rootDir>/node_modules/react$1',
        '^@mocks/(.*)$': '<rootDir>/__mocks__/$1',
        '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    },
    collectCoverageFrom: ['src/**', '!src/styles/specials/winter/snow/LetItSnow.tsx'],
    coverageReporters: ['json-summary', 'text-summary', 'lcov'],
    reporters: [
        'default',
        ['jest-junit', { suiteName: 'jest tests', outputDirectory: 'coverage', outputName: 'junit.xml' }],
    ],
};
