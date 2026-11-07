import { z } from "zod";

export const updateProfileSchema = z.object({
    firstname: z.string().trim().min(2).max(50),
    lastname: z.string().trim().min(2).max(50),
    phone: z.string().trim().min(5).max(20)
}).strict();

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128)
}).strict();