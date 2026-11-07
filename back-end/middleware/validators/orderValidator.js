import { z } from "zod";

export const createOrderSchema = z.object({
    address: z.string().trim().min(5).max(500),

    items: z.array(
        z.object({
            productid: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().positive()
        }).strict()
    ).min(1).max(50)
}).strict();

export const orderParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/)
}).strict();