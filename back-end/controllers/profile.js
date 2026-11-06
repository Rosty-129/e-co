import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const PROFILE_SELECT = {
  id: true,
  email: true,
  firstname: true,
  lastname: true,
  phone: true,
  pendingEmail: true,
};

export const getprofile = async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await prisma.User.findUnique({
      where: { id: userid },
      select: PROFILE_SELECT,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "user found", all: user });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateprofile = async (req, res) => {
  const userid = req.user.id;
  const { email, firstname, lastname, phone } = req.body;

  if (email !== undefined && typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const current = await prisma.User.findUnique({
      where: { id: userid },
      select: { id: true, email: true },
    });
    if (!current) return res.status(404).json({ message: "User not found" });

    const emailIsChanging =
      typeof email === "string" &&
      email.trim().length > 0 &&
      email.trim().toLowerCase() !== current.email.toLowerCase();

    const updateData = { firstname, lastname, phone };

    if (!emailIsChanging) {
      await prisma.User.update({ where: { id: userid }, data: updateData });
      return res.status(200).json({ message: "user updated" });
    }

    const newEmail = email.trim().toLowerCase();

    const conflict = await prisma.User.findFirst({
      where: { email: newEmail, NOT: { id: userid } },
      select: { id: true },
    });
    if (conflict) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresat = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.User.update({
      where: { id: userid },
      data: {
        ...updateData,
        pendingEmail: newEmail,
        pendingEmailCode: code,
        pendingEmailExpires: expiresat,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newEmail,
        subject: "Confirm your new email address",
        text: `Your confirmation code is ${code}. It expires at ${expiresat}.`,
      });
    } catch (mailErr) {
      console.error("EMAIL CHANGE SEND ERROR:", mailErr);
      await prisma.User.update({
        where: { id: userid },
        data: {
          pendingEmail: null,
          pendingEmailCode: null,
          pendingEmailExpires: null,
        },
      });
      return res
        .status(502)
        .json({ message: "Could not send verification email. Try again." });
    }

    return res.status(200).json({
      message:
        "A confirmation code was sent to the new address. Your email will update once confirmed.",
      pendingEmail: newEmail,
      devCode: code,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Update failed" });
  }
};

export const verifyEmailChange = async (req, res) => {
  const userid = req.user.id;
  const { code } = req.body;

  if (typeof code !== "string" || code.length === 0) {
    return res.status(400).json({ message: "Code is required" });
  }

  try {
    const user = await prisma.User.findUnique({
      where: { id: userid },
      select: {
        id: true,
        pendingEmail: true,
        pendingEmailCode: true,
        pendingEmailExpires: true,
      },
    });

    if (!user || !user.pendingEmail || !user.pendingEmailCode) {
      return res.status(400).json({ message: "No pending email change" });
    }

    if (code !== user.pendingEmailCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (!user.pendingEmailExpires || new Date() > user.pendingEmailExpires) {
      return res.status(400).json({ message: "Code expired" });
    }

    const conflict = await prisma.User.findFirst({
      where: { email: user.pendingEmail, NOT: { id: userid } },
      select: { id: true },
    });
    if (conflict) {
      await prisma.User.update({
        where: { id: userid },
        data: {
          pendingEmail: null,
          pendingEmailCode: null,
          pendingEmailExpires: null,
        },
      });
      return res.status(409).json({ message: "Email already in use" });
    }

    const updated = await prisma.User.update({
      where: { id: userid },
      data: {
        email: user.pendingEmail,
        isVerified: true,
        pendingEmail: null,
        pendingEmailCode: null,
        pendingEmailExpires: null,
      },
      select: PROFILE_SELECT,
    });

    return res.status(200).json({
      message: "Email updated successfully",
      user: updated,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("VERIFY EMAIL CHANGE ERROR:", err);
    return res.status(500).json({ message: "Server error while verifying" });
  }
};

export const cancelEmailChange = async (req, res) => {
  const userid = req.user.id;
  try {
    await prisma.User.update({
      where: { id: userid },
      data: {
        pendingEmail: null,
        pendingEmailCode: null,
        pendingEmailExpires: null,
      },
    });
    return res.status(200).json({ message: "Pending email change cancelled" });
  } catch (err) {
    console.error("CANCEL EMAIL CHANGE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const changepassword = async (req, res) => {
  const userid = req.user.id;
  const { oldpassword, newpassword } = req.body;

  if (typeof oldpassword !== "string" || typeof newpassword !== "string") {
    return res.status(400).json({ message: "Invalid input" });
  }
  if (newpassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  if (oldpassword === newpassword) {
    return res.status(400).json({ message: "New password must differ from old" });
  }

  try {
    const user = await prisma.User.findUnique({
      where: { id: userid },
      select: { password: true },
    });
    if (!user) return res.status(401).json({ message: "Invalid session" });

    const ok = await bcrypt.compare(oldpassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    const hash = await bcrypt.hash(newpassword, 10);
    await prisma.User.update({ where: { id: userid }, data: { password: hash } });

    return res.status(200).json({ message: "password updated" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default prisma;