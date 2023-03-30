import { Db, MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function createInMemoryMongoDb() {
    return await MongoMemoryServer.create({
        binary: {
            version: "6.0.3",
        },
    });
}

export function createMongoClient(uri: string) {
    const client = new MongoClient(uri);
    return client;
}