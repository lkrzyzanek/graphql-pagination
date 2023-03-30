import { server } from "./server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { dataSourceLoaderPager, DefaultCursorEncoderDecoder } from "@graphql-pagination/core";
import { createInMemoryMongoDb, createMongoClient } from "./datasources/db";
import { createBooksDataSource, insertTestData } from "./datasources/booksApi";
import type { DataSourceContext } from "./types/DataSourceContext";
import { ObjectIdCursorEncoderDecoder } from "@graphql-pagination/mongodb";

const cursor = new ObjectIdCursorEncoderDecoder();

async function start() {
    const mongod = await createInMemoryMongoDb();
    const client = createMongoClient(mongod.getUri());
    const mongoDb = client.db("data");
    await insertTestData(mongoDb);
    const dataSource = await createBooksDataSource(mongoDb);

    const { url } = await startStandaloneServer<DataSourceContext>(server, {
        context: async () => ({
            booksPager: dataSourceLoaderPager({ dataSource, cursor, fetchTotalCountInResolver: false }),
        }),
        listen: { port: 4000 }
    });
    console.log(`🚀  Server ready at ${url}`);
}

start();
