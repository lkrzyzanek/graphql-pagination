import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    schema: ["./src/typeDefs/index.ts"],
    generates: {
        "./src/__generated__/resolversTypes.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            // https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-resolvers
            config: {
                useIndexSignature: true,
                federation: true,
                contextType: "../types/DataSourceContext#DataSourceContext",
                avoidOptionals: {
                    field: false,
                    inputValue: true,
                    object: false,
                    defaultValue: true,
                },
            },
        },
    },
};

export default config;