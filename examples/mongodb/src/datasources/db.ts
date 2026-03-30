import { Db, MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function createInMemoryMongoDb() {
    const mongoMemoryVersion = process.env.MONGOMS_VERSION ?? "6.0.14";
    return await MongoMemoryServer.create({
        binary: {
            version: mongoMemoryVersion,
        },
    });
}

export function createMongoClient(uri: string) {
    const client = new MongoClient(uri);
    return client;
}