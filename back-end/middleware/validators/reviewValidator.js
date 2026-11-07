import { z } from "zod";

export const createReviewSchema = z.object({
    productid: z.coerce.number().int().positive(),

    text: z.string().trim().min(3).max(2000)
}).strict();

export const updateReviewSchema = z.object({
    text: z.string().trim().min(3).max(2000)
}).strict();

export const reviewParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/)
}).strict();