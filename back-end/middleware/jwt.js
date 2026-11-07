
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export const verify = async (req, res, next) => {
    const authheader = req.headers.authorization;

    if (!authheader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No valid token provided",
            code: "UNAUTHORIZED"
        });
    }

    const token = authheader.slice(7);

    let decoded;

    // Verify JWT
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.sid || !decoded.id) {
            return res.status(401).json({
                message: "Invalid session token",
                code: "SESSION_EXPIRED"
            });
        }

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            code: "UNAUTHORIZED"
        });
    }

    try {
        // Atomically check and extend the session.
        // Expiration can never exceed absoluteExpiresAt.
        const activeSession = await prisma.$queryRaw`
            UPDATE "Session"
            SET "expiresAt" = LEAST(
                GREATEST(
                    "expiresAt",
                    NOW() + (${INACTIVITY_TIMEOUT} * INTERVAL '1 millisecond')
                ),
                "absoluteExpiresAt"
            )
            WHERE "id" = ${decoded.sid}
              AND "userId" = ${decoded.id}
              AND "expiresAt" > NOW()
              AND "absoluteExpiresAt" > NOW()
            RETURNING "id"
        `;

        if (activeSession.length === 0) {
            return res.status(401).json({
                message: "Your session has expired. Please log in again.",
                code: "SESSION_EXPIRED"
            });
        }

        req.user = decoded;

        return next();

    } catch (error) {
        console.error("SESSION VERIFICATION ERROR:", error);

        return res.status(503).json({
            message: "Unable to verify your session. Please try again.",
            code: "SESSION_CHECK_FAILED"
        });
    }
};
