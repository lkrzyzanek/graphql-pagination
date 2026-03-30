/** @type {import("jest").Config} */
module.exports = {
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
    transform: {
        "^.+\\.ts$": [
            "@swc/jest",
            {
                jsc: {
                    target: "es2022",
                    parser: {
                        syntax: "typescript",
                        decorators: true
                    }
                },
                module: {
                    type: "commonjs"
                }
            }
        ],
    }
};