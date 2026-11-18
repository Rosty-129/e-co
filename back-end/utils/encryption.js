
import crypto from "crypto";

const getEncryptionKey = () => {
    const key = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

    if (!key) {
        throw new Error("Missing Google encryption key");
    }

    const buffer = Buffer.from(key, "base64");

    if (buffer.length !== 32) {
        throw new Error("Encryption key must be 32 bytes");
    }

    return buffer;
};

export function encryptToken(token) {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        iv
    );

    let encrypted = cipher.update(token, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted
    ].join(".");
}

export function decryptToken(encryptedToken) {
    const [iv, authTag, encrypted] = encryptedToken.split(".");

    if (!iv || !authTag || !encrypted) {
        throw new Error("Invalid encrypted token");
    }

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        Buffer.from(iv, "base64")
    );

    decipher.setAuthTag(Buffer.from(authTag, "base64"));

    let decrypted = decipher.update(
        encrypted,
        "base64",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
}
