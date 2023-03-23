/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    coverageDirectory: "coverage",
    reporters: [
        "default",
        "jest-junit",
    ],
    coverageReporters: [
        "text",
        "text-summary",
        "cobertura",
    ],
    coveragePathIgnorePatterns: [
        "node_modules",
        "dist",
    ],
};