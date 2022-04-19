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

    test("decode-number", () => {
        const decoded = cursor.decode(Buffer.from("n_123").toString("base64"));
        expect(decoded).toBe(123);
    });

});
