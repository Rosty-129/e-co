import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROFILE_SELECT = {
  id: true,
  email: true,
  firstname: true,
  lastname: true,
  phone: true,
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
  const { email, firstname, lastname, phone, currentPassword } = req.body;

  if (email !== undefined && typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const current = await prisma.User.findUnique({
      where: { id: userid },
      select: { id: true, email: true, password: true },
    });
    if (!current) return res.status(404).json({ message: "User not found" });

    const newEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailIsChanging =
      newEmail.length > 0 && newEmail !== current.email.toLowerCase();

    if (!emailIsChanging) {
      await prisma.User.update({
        where: { id: userid },
        data: { firstname, lastname, phone },
      });
      return res.status(200).json({ message: "user updated" });
    }

    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return res
        .status(400)
        .json({ message: "Current password is required to change email" });
    }

    const ok = await bcrypt.compare(currentPassword, current.password);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const conflict = await prisma.User.findFirst({
      where: { email: newEmail, NOT: { id: userid } },
      select: { id: true },
    });
    if (conflict) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updated = await prisma.User.update({
      where: { id: userid },
      data: {
        email: newEmail,
        firstname,
        lastname,
        phone,
      },
      select: PROFILE_SELECT,
    });

    return res.status(200).json({
      message: "user updated",
      all: updated,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Update failed" });
  }
};

export const changepassword = async (req, res) => {
  const userid = req.user.id;
  const { oldpassword, newpassword } = req.body;

  if (typeof oldpassword !== "string" || typeof newpassword !== "string") {
    return res.status(400).json({ message: "Invalid input" });
  }
  if (newpassword.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
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
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hash = await bcrypt.hash(newpassword, 10);
    await prisma.User.update({ where: { id: userid }, data: { password: hash } });

    return res.status(200).json({ message: "password updated" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default prisma;