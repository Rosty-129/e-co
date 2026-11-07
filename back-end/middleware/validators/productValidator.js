import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().trim().min(2).max(150),

    description: z.string().max(5000).nullable().optional(),

    categoryid: z.coerce.number().int().positive(),

    price: z.coerce.number().int().nonnegative(),

    Stock: z.coerce.number().int().nonnegative()
}).strict();

export const updateProductSchema = z.object({
    name: z.string().trim().min(2).max(150).optional(),

    description: z.string().max(5000).nullable().optional(),

    categoryid: z.coerce.number().int().positive().optional(),

    price: z.coerce.number().int().nonnegative().optional(),

    Stock: z.coerce.number().int().nonnegative().optional()
}).strict().refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

export const productParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/)
}).strict();