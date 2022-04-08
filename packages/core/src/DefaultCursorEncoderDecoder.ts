import type {CursorEncoderDecoder} from "./CursorPagerSpec";

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
        const value = id.split("_")[1];

        if (id.startsWith("d_")) return new Date(Number(value));
        if (id.startsWith("n_")) return Number(value);

        return value;
    }

}
