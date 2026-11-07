
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify Cloudflare Turnstile CAPTCHA
const verifyTurnstile = async (token) => {
    if (!token || typeof token !== "string") {
        return false;
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
        console.error("TURNSTILE_SECRET_KEY is missing");
        return false;
    }

    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: token
                })
            }
        );

        if (!response.ok) return false;

        const result = await response.json();

        return result.success === true;

    } catch (error) {
        console.error("TURNSTILE ERROR:", error);
        return false;
    }
};

// Only return public user information
const publicUser = (user) => {
    const {
        password,
        verificationCode,
        CodeExpiresAt,
        ResetCode,
        ResetCodeExpires,
        ...safeUser
    } = user;

    return safeUser;
};

// Create database session and JWT
const createSessionAndToken = async (user, database = prisma) => {
    const now = Date.now();

    const absoluteExpiresAt = new Date(
        now + ABSOLUTE_TIMEOUT
    );

    const expiresAt = new Date(
        Math.min(
            now + INACTIVITY_TIMEOUT,
            absoluteExpiresAt.getTime()
        )
    );

    const session = await database.session.create({
        data: {
            userId: user.id,
            expiresAt,
            absoluteExpiresAt
        }
    });

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            sid: session.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );

    return token;
};

// REGISTER
export const register = async (req, res) => {
    const {
        firstname,
        lastname,
        email,
        password,
        phone,
        turnstileToken
    } = req.body;

    try {
        const captchaValid = await verifyTurnstile(turnstileToken);

        if (!captchaValid) {
            return res.status(400).json({
                message: "CAPTCHA verification failed. Please try again."
            });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const code = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        const expiresat = new Date(
            Date.now() + 15 * 60 * 1000
        );

        const newuser = await prisma.User.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedpassword,
                phone,
                role: "USER",
                verificationCode: code,
                CodeExpiresAt: expiresat
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verification Code",
            text: `This is your code: ${code}. It expires at ${expiresat}`
        });

        return res.status(201).json({
            message: "Verification sent"
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(400).json({
            message: "Could not register user"
        });
    }
};

// VERIFY EMAIL CODE
export const verifycode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await prisma.User.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Could not find user"
            });
        }

        if (code !== user.verificationCode) {
            return res.status(400).json({
                message: "Invalid code"
            });
        }

        if (!user.CodeExpiresAt || new Date() > user.CodeExpiresAt) {
            return res.status(400).json({
                message: "Code expired"
            });
        }

        const verifiedUser = await prisma.User.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null,
                CodeExpiresAt: null
            }
        });

        const token = await createSessionAndToken(verifiedUser);

        return res.status(200).json({
            message: "Registration successful!",
            token,
            user: publicUser(verifiedUser)
        });

    } catch (error) {
        console.error("VERIFY ERROR:", error);

        return res.status(500).json({
            message: "Server problem in verifying"
        });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password, turnstileToken } = req.body;

        const captchaValid = await verifyTurnstile(turnstileToken);

        if (!captchaValid) {
            return res.status(400).json({
                message: "CAPTCHA verification failed. Please try again."
            });
        }

        const check = await prisma.User.findUnique({
            where: { email }
        });

        if (!check) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (!check.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                code: "UNVERIFIED"
            });
        }

        const hashed = await bcrypt.compare(
            password,
            check.password
        );

        if (!hashed) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = await createSessionAndToken(check);

        return res.status(200).json({
            message: "Successfully logged in",
            token,
            user: publicUser(check)
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Could not login"
        });
    }
};

// FORGOT PASSWORD
export const forgotpassword = async (req, res) => {
    const { email, turnstileToken } = req.body;

    try {
        const captchaValid = await verifyTurnstile(turnstileToken);

        if (!captchaValid) {
            return res.status(400).json({
                message: "CAPTCHA verification failed. Please try again."
            });
        }

        const user = await prisma.User.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const code = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        const expiresat = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await prisma.User.update({
            where: { id: user.id },
            data: {
                ResetCode: code,
                ResetCodeExpires: expiresat
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Code",
            text: `Your reset code is ${code}. It expires at ${expiresat}`
        });

        return res.status(200).json({
            message: "Reset code sent"
        });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({
            message: "Error sending reset code"
        });
    }
};

// VERIFY RESET CODE AND CHANGE PASSWORD
export const verifyinglogin = async (req, res) => {
    const { email, code, password } = req.body;

    try {
        const user = await prisma.User.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.ResetCode !== code) {
            return res.status(400).json({
                message: "Invalid code"
            });
        }

        if (
            !user.ResetCodeExpires ||
            new Date() > user.ResetCodeExpires
        ) {
            return res.status(400).json({
                message: "Code expired"
            });
        }

        const newhashedpassword = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.User.update({
            where: { id: user.id },
            data: {
                password: newhashedpassword,
                ResetCode: null,
                ResetCodeExpires: null
            }
        });

        // Invalidate all previous sessions after password reset.
        const token = await prisma.$transaction(async (tx) => {
            await tx.session.deleteMany({
                where: {
                    userId: updatedUser.id
                }
            });

            return createSessionAndToken(updatedUser, tx);
        });

        return res.status(200).json({
            message: "Password successfully changed",
            token,
            user: publicUser(updatedUser)
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            message: "Error resetting password"
        });
    }
};

// LOGOUT
export const logout = async (req, res) => {
    try {
        await prisma.session.deleteMany({
            where: {
                id: req.user.sid,
                userId: req.user.id
            }
        });

        return res.status(200).json({
            message: "Successfully logged out"
        });

    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            message: "Could not log out"
        });
    }
};

export default prisma;
