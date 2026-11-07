import { z } from "zod";

export const addToCartSchema = z.object({
    quantity: z.number().int().positive()
}).strict();

export const updateCartSchema = z.object({
    quantity: z.number().int().positive()
}).strict();

export const cartItemParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/)
}).strict();