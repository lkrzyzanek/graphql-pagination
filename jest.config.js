/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
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
            "ts-jest",
            {
                tsconfig: {
                    "types": ["node", "jest"],
                    "target": "es2022",
                    "module": "commonjs",
                    "moduleResolution": "node",
                    "esModuleInterop": true,
                    "strict": true,
                    "noImplicitAny": false,
                    "noImplicitReturns": true,
                    "noImplicitOverride": false,
                    "noFallthroughCasesInSwitch": true,
                    "noUnusedParameters": true,
                    "noUnusedLocals": false,
                    "lib": ["es2022"],
                    noImplicitAny: false,
                },
            },
        ],
    }
};