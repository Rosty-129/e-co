
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
        throw new Error("Missing FRONTEND_URL");
    }

    return url.replace(/\/$/, "");
};

// 1. START GOOGLE CONNECTION
export const connectGoogle = async (req, res) => {
    try {
        if (!req.user?.id || req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Admin access required"
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
                "https://www.googleapis.com/auth/documents",
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

// 2. GOOGLE OAUTH CALLBACK
export const googleCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

    try {
        if (!frontendUrl) {
            throw new Error("Missing FRONTEND_URL");
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

        // Preserve the previous refresh token if Google doesn't
        // return a new one.
        const existingConnection = await prisma.googleConnection.findUnique({
            where: {
                userId: admin.id
            }
        });

        const refreshToken =
            tokens.refresh_token ||
            (
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

// 3. CHECK GOOGLE CONNECTION
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

// 4. EXPORT DASHBOARD TO GOOGLE DOCS
export const exportDashboardToGoogle = async (req, res) => {
    try {
        if (!req.user?.id || req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        // Get the admin's Google connection.
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

        // Decrypt the stored refresh token.
        const refreshToken = decryptToken(
            connection.refreshTokenEncrypted
        );

        const oauth2Client = getGoogleClient();

        oauth2Client.setCredentials({
            refresh_token: refreshToken
        });

        // Initialize Google Docs API.
        const docs = google.docs({
            version: "v1",
            auth: oauth2Client
        });

        // Fetch fresh dashboard statistics.
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

        const totalRevenue = Number(revenue._sum.total || 0);

        // Generate document title.
        const generatedAt = new Date();

        const date = generatedAt.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC"
        });

        const documentTitle =
            `E-Co Dashboard Report - ${generatedAt.toISOString().slice(0, 10)}`;

        // Prepare document content.
        const content = [
            "E-CO DASHBOARD REPORT",
            "",
            `Generated At: ${date} UTC`,
            "",
            "BUSINESS OVERVIEW",
            "----------------------------------------",
            `Total Revenue: $${totalRevenue.toFixed(2)}`,
            `Total Orders: ${totalOrders}`,
            `Pending Orders: ${pendingOrders}`,
            `Completed Orders: ${completedOrders}`,
            "",
            "CUSTOMER OVERVIEW",
            "----------------------------------------",
            `Total Customers: ${customers}`,
            "",
            "INVENTORY OVERVIEW",
            "----------------------------------------",
            `Total Products: ${products}`,
            `Low Stock Products: ${lowStock}`,
            `Out of Stock Products: ${outOfStock}`,
            "",
            "----------------------------------------",
            "Generated automatically by E-Co Admin Dashboard."
        ].join("\n");

        // Create a new Google Docs document.
        const document = await docs.documents.create({
            requestBody: {
                title: documentTitle
            }
        });

        const documentId = document.data.documentId;

        if (!documentId) {
            throw new Error("Google Docs did not return a document ID");
        }

        // Insert dashboard information into the document.
        await docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests: [
                    {
                        insertText: {
                            location: {
                                index: 1
                            },
                            text: content
                        }
                    },
                    {
                        updateParagraphStyle: {
                            range: {
                                startIndex: 1,
                                endIndex: "E-CO DASHBOARD REPORT".length + 1
                            },
                            paragraphStyle: {
                                namedStyleType: "TITLE"
                            },
                            fields: "namedStyleType"
                        }
                    }
                ]
            }
        });

        // Return the actual Google Docs URL.
        const documentUrl =
            `https://docs.google.com/document/d/${documentId}/edit`;

        return res.status(200).json({
            success: true,
            documentId,
            documentUrl,
            message: "Google Docs report created successfully"
        });

    } catch (error) {
        console.error("Google Docs export error:", error);

        return res.status(500).json({
            message: "Google Docs export failed"
        });
    }
};
