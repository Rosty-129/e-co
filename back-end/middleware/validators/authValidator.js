import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstname: z.string().trim().min(2).max(50),
    lastname: z.string().trim().min(2).max(50),
    phone: z.string().trim().min(5).max(20),
    turnstileToken: z.string().min(1)
}).strict();

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    turnstileToken: z.string().min(1)
}).strict();

export const verifyEmailSchema = z.object({
    email: z.string().email(),
    verificationCode: z.string().min(1)
}).strict();

export const forgotPasswordSchema = z.object({
    email: z.string().email()
}).strict();

export const resetPasswordSchema = z.object({
    email: z.string().email(),
    resetCode: z.string().min(1),
    newPassword: z.string().min(8).max(128)
}).strict();