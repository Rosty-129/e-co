import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().max(1000).nullable().optional()
}).strict();

export const updateCategorySchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().max(1000).nullable().optional()
}).strict().refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

export const categoryParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/)
}).strict();