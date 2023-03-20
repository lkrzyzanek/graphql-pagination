import type { CursorEncoderDecoder } from "./CursorPagerSpec";
import { GraphQLError } from "graphql";

/**
 * Default Cursor encoder / decoder.
 * Supports string, number, Date types
 */
export class DefaultCursorEncoderDecoder<IdType = string | number | Date> implements CursorEncoderDecoder<IdType> {

    encode(plainCursor: IdType): string {
        let id = "c_" + plainCursor;
        if (plainCursor instanceof Date) id = "d_" + plainCursor.getTime();
        if (typeof plainCursor === "number") id = "n_" + plainCursor;
        return Buffer.from(id).toString("base64");
    }

    decode(encodedCursor: string): IdType {
        const id = Buffer.from(encodedCursor, "base64").toString("utf-8");
        if (id.length <= 2) throw new GraphQLError("Invalid cursor value", { extensions: { code: "BAD_USER_INPUT" } });
        const value = id.substring(2);

        if (id.startsWith("d_")) return new Date(Number(value)) as IdType;
        if (id.startsWith("n_")) return Number(value) as IdType;
        if (id.startsWith("c_")) return value as IdType;

        throw new GraphQLError("Invalid cursor value", { extensions: { code: "BAD_USER_INPUT" } });
    }

}

