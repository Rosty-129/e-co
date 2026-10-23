import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Helper function to generate tokens (fixes the typo in one place)
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Fixed: was 'epiresin'
    );
};

export const register = async (req, res) => {
    const { firstname, lastname, email, password, phone, role } = req.body;

    try {
        const hashedpassword = await bcrypt.hash(password, 10);
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresat = new Date(Date.now() + 15 * 60 * 1000);

        const newuser = await prisma.User.create({
            data: { 
                firstname, 
                lastname, 
                email, 
                password: hashedpassword, 
                phone, 
                role: role || "USER", // Default role if not provided
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

        // We return devCode here so your frontend DevHint shows it!
        return res.status(201).json({ 
            message: "Verification sent", 
            devCode: code 
        });

    } catch (error) {
        // THIS LINE will print the exact error in your backend terminal
        console.error("REGISTER ERROR:", error); 
        return res.status(400).json({ message: error.message || "Could not register user" });
    }
};

export const verifycode = async (req, res) => {
    // Note: your frontend sends { email, code }, so we destructure it that way
    const { email, code } = req.body; 

    try {
        const user = await prisma.User.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Could not find user" });
        }

        if (code !== user.verificationCode) {
            return res.status(400).json({ message: "Invalid code" });
        }

        if (new Date() > user.CodeExpiresAt) {
            return res.status(400).json({ message: "Code expired" });
        }

        const verifiedUser = await prisma.User.update({
            where: { id: user.id },
            data: { isVerified: true, verificationCode: null, CodeExpiresAt: null }
        });

        const token = generateToken(verifiedUser);

        return res.status(200).json({ 
            message: "Registration successful!", 
            token, 
            user: verifiedUser // Send user back so frontend can log them in
        });

    } catch (error) {
        console.error("VERIFY ERROR:", error);
        return res.status(401).json({ message: "Server problem in verifying" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const check = await prisma.User.findUnique({ where: { email } });

        if (!check) {
            return res.status(401).json({ message: "Couldn't find user" });
        }

        if (!check.isVerified) {
            return res.status(403).json({ 
                message: "Please verify your email first",
                code: "UNVERIFIED" // Helps your frontend redirect
            });
        }

        const hashed = await bcrypt.compare(password, check.password);

        if (!hashed) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Fixed: Was using 'user.id' which didn't exist. Now uses 'check.id'
        const token = generateToken(check);

        return res.status(200).json({
            message: "Successfully logged in",
            token,
            user: check // Send user back so frontend saves it
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(400).json({ message: error.message || "Could not login" });
    }
};

export const forgotpassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.User.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresat = new Date(Date.now() + 15 * 60 * 1000);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Code",
            text: `Your reset code is ${code}. It expires at ${expiresat}`
        });

        await prisma.User.update({
            where: { id: user.id },
            data: { ResetCode: code, ResetCodeExpires: expiresat }
        });

        // Return devCode for frontend DevHint
        return res.status(200).json({ message: "Reset code sent", devCode: code });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        return res.status(401).json({ message: error.message || "Error sending reset code" });
    }
};

export const verifyinglogin = async (req, res) => {
    // Your frontend calls this with { email, code, password }
    const { email, code, password } = req.body;

    try {
        const user = await prisma.User.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.ResetCode !== code) { // Fixed: was ResetCode variable, now code from body
            return res.status(400).json({ message: "Invalid code" });
        }

        if (new Date() > user.ResetCodeExpires) {
            return res.status(400).json({ message: "Code expired" });
        }

        const newhashedpassword = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.User.update({
            where: { id: user.id },
            data: { password: newhashedpassword, ResetCode: null, ResetCodeExpires: null }
        });

        const token = generateToken(updatedUser);

        return res.status(200).json({
            message: "Password successfully changed",
            token,
            user: updatedUser
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        return res.status(401).json({ message: error.message || "Error resetting password" });
    }
};

export default prisma;