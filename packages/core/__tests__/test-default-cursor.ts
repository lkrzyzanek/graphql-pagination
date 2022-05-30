import {DefaultCursorEncoderDecoder} from "../src";

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
    test("decode-string-empty", () => {
        expect(() => cursor.decode(Buffer.from("c_").toString("base64"))).toThrow(new Error("Invalid cursor value"));
    });

    test("decode-number", () => {
        const decoded = cursor.decode(Buffer.from("n_123").toString("base64"));
        expect(decoded).toBe(123);
    });
    test("decode-string-empty", () => {
        expect(() => cursor.decode(Buffer.from("n_").toString("base64"))).toThrow(new Error("Invalid cursor value"));
    });

    test("encode-decode-date", () => {
        const now = new Date();
        const decoded = cursor.decode(cursor.encode(now));
        expect(decoded).toStrictEqual(now);
    });

});
