import { z } from "zod";

export const imageParamsSchema = z.object({
    id: z.string().regex(/^[1-9]\d*$/)
}).strict();