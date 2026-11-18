
import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

import {
    encryptToken,
    decryptToken
} from "../utils/encryption.js";

const prisma = new PrismaClient();

const getGoogleClient = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID_DOCS,
        process.env.GOOGLE_CLIENT_SECRET_DOCS,
        process.env.GOOGLE_REDIRECT_URI_DOCS
    );
};

// START GOOGLE CONNECTION
export const connectGoogle = async (req, res) => {
    try {
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
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/admin/dashboard?google=denied`
            );
        }

        if (!code || !state) {
            return res.status(400).send("Missing OAuth parameters");
        }

        const decoded = jwt.verify(
            state,
            process.env.JWT_SECRET
        );

        if (decoded.purpose !== "google-oauth") {
            return res.status(400).send("Invalid OAuth state");
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

        if (!tokens.refresh_token) {
            throw new Error("Google did not return a refresh token");
        }

        const encryptedToken = encryptToken(
            tokens.refresh_token
        );

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
            `${process.env.FRONTEND_URL}/admin/dashboard?google=connected`
        );

    } catch (error) {
        console.error("Google callback error:", error);

        return res.redirect(
            `${process.env.FRONTEND_URL}/admin/dashboard?google=error`
        );
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
        console.error(error);

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

        // Fetch fresh database statistics
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
            ["Total Revenue", revenue._sum.total || 0],
            ["Total Orders", totalOrders],
            ["Pending Orders", pendingOrders],
            ["Completed Orders", completedOrders],
            ["Total Customers", customers],
            ["Total Products", products],
            ["Low Stock Products", lowStock],
            ["Out of Stock Products", outOfStock]
        ];

        // Create spreadsheet
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
            url: spreadsheet.data.spreadsheetUrl
        });

    } catch (error) {
        console.error("Google export error:", error);

        return res.status(500).json({
            message: "Google Sheets export failed"
        });
    }
};
