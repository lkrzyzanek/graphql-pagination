import { DefaultCursorEncoderDecoder } from "../src";
import { GraphQLError } from "graphql";

describe("cursor", () => {

    function validateInvalidCursor(e) {
        expect(e.message).toBe("Invalid cursor value");
        const ex = e as GraphQLError;
        expect(ex.extensions).toStrictEqual({ code: "BAD_USER_INPUT" });
    }

    test("decode-bad-input", () => {
        try {
            new DefaultCursorEncoderDecoder<string>().decode("bad_input");
            throw new Error("no error thrown");
        } catch (e) {
            validateInvalidCursor(e);
        }
        try {
            new DefaultCursorEncoderDecoder<string>().decode("a");
            throw new Error("no error thrown");
        } catch (e) {
            validateInvalidCursor(e);
        }
    });

    test("encode-string", () => {
        const encoded = new DefaultCursorEncoderDecoder<string>().encode("test-string");
        expect(encoded).toBe(Buffer.from("c_test-string").toString("base64"));
    });

    test("encode-number", () => {
        const encoded = new DefaultCursorEncoderDecoder<number>().encode(123);
        expect(encoded).toBe(Buffer.from("n_123").toString("base64"));
    });

    test("encode-object", () => {
        const o = { test: "test" };
        const encoded = new DefaultCursorEncoderDecoder<Record<string, any>>().encode(o);
        expect(encoded).toBe(Buffer.from("o_" + JSON.stringify(o)).toString("base64"));
    });

    test("decode-string", () => {
        const decoded = new DefaultCursorEncoderDecoder<string>().decode(Buffer.from("c_test-string").toString("base64"));
        expect(decoded).toBe("test-string");
    });
    test("decode-string_underscore", () => {
        const decoded = new DefaultCursorEncoderDecoder<string>().decode(Buffer.from("c_test_underscore").toString("base64"));
        expect(decoded).toBe("test_underscore");
    });
    test("decode-string-empty", () => {
        try {
            new DefaultCursorEncoderDecoder<string>().decode(Buffer.from("c_").toString("base64"));
            throw new Error("no error thrown");
        } catch (e) {
            validateInvalidCursor(e);
        }
    });

    test("decode-number", () => {
        const decoded = new DefaultCursorEncoderDecoder<number>().decode(Buffer.from("n_123").toString("base64"));
        expect(decoded).toBe(123);
    });

    test("decode-object", () => {
        const o = { test: "test" };
        const decoded = new DefaultCursorEncoderDecoder<Record<string, any>>().decode(Buffer.from("o_" + JSON.stringify(o)).toString("base64"));
        expect(decoded).toStrictEqual(o);
    });

    test("decode-object-invalid-json", () => {
        try {
            new DefaultCursorEncoderDecoder<number>().decode(Buffer.from("o_xx").toString("base64"));
        } catch (e) {
            validateInvalidCursor(e);
        }
    });
    
    test("decode-string-empty", () => {
        try {
            new DefaultCursorEncoderDecoder<number>().decode(Buffer.from("n_").toString("base64"));
        } catch (e) {
            validateInvalidCursor(e);
        }
    });

    test("encode-decode-date", () => {
        const now = new Date();
        const cursor = new DefaultCursorEncoderDecoder<Date>();
        const decoded = cursor.decode(cursor.encode(now));
        expect(decoded).toStrictEqual(now);
    });

});
