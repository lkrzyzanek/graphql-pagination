import type {CursorEncoderDecoder} from "./CursorPagerSpec";
import { GraphQLError } from "graphql";

/**
 * Default Cursor encoder / decoder.
 * Supports string, number, Date types
 */
export class DefaultCursorEncoderDecoder implements CursorEncoderDecoder<string | number | Date> {

    encode(plainCursor: string | number | Date): string {
        let id = "c_" + plainCursor;
        if (plainCursor instanceof Date) id = "d_" + plainCursor.getTime();
        if (typeof plainCursor === "number") id = "n_" + plainCursor;
        return Buffer.from(id).toString("base64");
    }

    decode(encodedCursor: string): string | number | Date {
        const id = Buffer.from(encodedCursor, "base64").toString("utf-8");
        if (id.length <= 2) throw new GraphQLError("Invalid cursor value", { extensions: { code: "BAD_USER_INPUT" } });
        const value = id.substring(2);

        if (id.startsWith("d_")) return new Date(Number(value));
        if (id.startsWith("n_")) return Number(value);
        if (id.startsWith("c_")) return value;

        throw new GraphQLError("Invalid cursor value", { extensions: { code: "BAD_USER_INPUT" } });
    }

}

