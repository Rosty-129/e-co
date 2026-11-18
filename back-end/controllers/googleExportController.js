import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import {
    encryptToken,
    decryptToken
} from "../utils/encryption.js";

const prisma = new PrismaClient();

const getGoogleClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID_DOCS;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET_DOCS;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI_DOCS;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error("Missing Google OAuth environment variables");
    }

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );
};

const getFrontendUrl = () => {
    const url = process.env.FRONTEND_URL;

    if (!url) {
        throw new Error("Missing FRONTEND_URL environment variable");
    }

    return url.replace(/\/$/, "");
};


// START GOOGLE CONNECTION
export const connectGoogle = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const state = jwt.sign(
            {
                userId: req.user.id,
                purpose: "google-oauth"
            },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        const oauth2Client = getGoogleClient();

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive.file"
            ],
            state
        });

        return res.json({ url });

    } catch (error) {
        console.error("Google connection error:", error);

        return res.status(500).json({
            message: "Could not start Google connection"
        });
    }
};


// GOOGLE CALLBACK
export const googleCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

    try {
        if (!frontendUrl) {
            throw new Error("Missing FRONTEND_URL environment variable");
        }

        const { code, state, error } = req.query;

        if (error) {
            return res.redirect(
                `${frontendUrl}/admin/dashboard?google=denied`
            );
        }

        if (!code || !state) {
            return res.redirect(
                `${frontendUrl}/admin/dashboard?google=error`
            );
        }

        const decoded = jwt.verify(
            state,
            process.env.JWT_SECRET
        );

        if (
            decoded.purpose !== "google-oauth" ||
            !decoded.userId
        ) {
            throw new Error("Invalid OAuth state");
        }

        const admin = await prisma.user.findUnique({
            where: {
                id: Number(decoded.userId)
            }
        });

        if (!admin || admin.role !== "ADMIN") {
            return res.status(403).send("Unauthorized");
        }

        const oauth2Client = getGoogleClient();

        const { tokens } = await oauth2Client.getToken(code);

        // Preserve an existing refresh token if Google doesn't return a new one.
        const existingConnection = await prisma.googleConnection.findUnique({
            where: {
                userId: admin.id
            }
        });

        const refreshToken = tokens.refresh_token
            || (
                existingConnection
                    ? decryptToken(existingConnection.refreshTokenEncrypted)
                    : null
            );

        if (!refreshToken) {
            throw new Error("Google did not provide a refresh token");
        }

        const encryptedToken = encryptToken(refreshToken);

        await prisma.googleConnection.upsert({
            where: {
                userId: admin.id
            },
            update: {
                refreshTokenEncrypted: encryptedToken
            },
            create: {
                userId: admin.id,
                refreshTokenEncrypted: encryptedToken
            }
        });

        return res.redirect(
            `${frontendUrl}/admin/dashboard?google=connected`
        );

    } catch (error) {
        console.error("Google callback error:", error);

        if (frontendUrl) {
            return res.redirect(
                `${frontendUrl}/admin/dashboard?google=error`
            );
        }

        return res.status(500).send("Google OAuth callback failed");
    }
};


// CHECK GOOGLE CONNECTION
export const googleConnectionStatus = async (req, res) => {
    try {
        const connection = await prisma.googleConnection.findUnique({
            where: {
                userId: req.user.id
            },
            select: {
                id: true
            }
        });

        return res.json({
            connected: Boolean(connection)
        });

    } catch (error) {
        console.error("Google status error:", error);

        return res.status(500).json({
            message: "Could not check Google connection"
        });
    }
};


// EXPORT DASHBOARD TO GOOGLE SHEETS
export const exportDashboardToGoogle = async (req, res) => {
    try {
        const connection = await prisma.googleConnection.findUnique({
            where: {
                userId: req.user.id
            }
        });

        if (!connection) {
            return res.status(400).json({
                message: "Connect your Google account first"
            });
        }

        const refreshToken = decryptToken(
            connection.refreshTokenEncrypted
        );

        const oauth2Client = getGoogleClient();

        oauth2Client.setCredentials({
            refresh_token: refreshToken
        });

        const sheets = google.sheets({
            version: "v4",
            auth: oauth2Client
        });

        // Fetch fresh dashboard statistics from PostgreSQL
        const [
            revenue,
            totalOrders,
            pendingOrders,
            completedOrders,
            customers,
            products,
            lowStock,
            outOfStock
        ] = await Promise.all([

            prisma.order.aggregate({
                _sum: {
                    total: true
                }
            }),

            prisma.order.count(),

            prisma.order.count({
                where: {
                    status: "PENDING"
                }
            }),

            prisma.order.count({
                where: {
                    status: "COMPLETED"
                }
            }),

            prisma.user.count({
                where: {
                    role: "USER"
                }
            }),

            prisma.product.count(),

            prisma.product.count({
                where: {
                    Stock: {
                        gt: 0,
                        lte: 5
                    }
                }
            }),

            prisma.product.count({
                where: {
                    Stock: 0
                }
            })
        ]);

        const rows = [
            ["E-Co Dashboard Report", "Value"],
            ["Generated At", new Date().toISOString()],
            ["Total Revenue", Number(revenue._sum.total || 0)],
            ["Total Orders", totalOrders],
            ["Pending Orders", pendingOrders],
            ["Completed Orders", completedOrders],
            ["Total Customers", customers],
            ["Total Products", products],
            ["Low Stock Products", lowStock],
            ["Out of Stock Products", outOfStock]
        ];

        // Create Google spreadsheet
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: `E-Co Dashboard ${new Date()
                        .toISOString()
                        .slice(0, 10)}`
                }
            }
        });

        const spreadsheetId = spreadsheet.data.spreadsheetId;

        const sheetTitle =
            spreadsheet.data.sheets?.[0]?.properties?.title || "Sheet1";

        // Insert dashboard data
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheetTitle.replace(/'/g, "''")}'!A1`,
            valueInputOption: "RAW",
            requestBody: {
                values: rows
            }
        });

        return res.json({
            success: true,
            spreadsheetUrl: spreadsheet.data.spreadsheetUrl
        });

    } catch (error) {
        console.error("Google export error:", error);

        return res.status(500).json({
            message: "Google Sheets export failed"
        });
    }
};