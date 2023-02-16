import { DefaultCursorEncoderDecoder } from "../src";
import { GraphQLError } from "graphql";

describe("cursor", () => {

    const cursor = new DefaultCursorEncoderDecoder();

    test("decode-bad-input", () => {
        expect(() => cursor.decode("bad_input")).toThrow(new Error("Invalid cursor value"));
        expect(() => cursor.decode("a")).toThrow(new Error("Invalid cursor value"));
    });

    test("encode-string", () => {
        const encoded = cursor.encode("test-string");
        expect(encoded).toBe(Buffer.from("c_test-string").toString("base64"));
    });

    test("encode-number", () => {
        const encoded = cursor.encode(123);
        expect(encoded).toBe(Buffer.from("n_123").toString("base64"));
    });

    test("decode-string", () => {
        const decoded = cursor.decode(Buffer.from("c_test-string").toString("base64"));
        expect(decoded).toBe("test-string");
    });
    test("decode-string_underscore", () => {
        const decoded = cursor.decode(Buffer.from("c_test_underscore").toString("base64"));
        expect(decoded).toBe("test_underscore");
    });
    function validateInvalidCursor(e: Error) {
        expect(e.message).toBe("Invalid cursor value");
        const ex = e as GraphQLError;
        expect(ex.extensions).toStrictEqual({ code: "BAD_USER_INPUT" });
    }
    test("decode-string-empty", () => {
        try {
            cursor.decode(Buffer.from("c_").toString("base64"));
            throw new Error("no error thrown");
        } catch (e) {
            validateInvalidCursor(e);
        }
    });

    test("decode-number", () => {
        const decoded = cursor.decode(Buffer.from("n_123").toString("base64"));
        expect(decoded).toBe(123);
    });
    test("decode-string-empty", () => {
        try {
            cursor.decode(Buffer.from("n_").toString("base64"));
        } catch (e) {
            validateInvalidCursor(e);
        }
    });

    test("encode-decode-date", () => {
        const now = new Date();
        const decoded = cursor.decode(cursor.encode(now));
        expect(decoded).toStrictEqual(now);
    });

});
