import { z } from "zod";

export const bookInputSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(200),
  isbn: z.string().trim().max(64).optional().or(z.literal("")),
  publisher: z.string().trim().max(200).optional().or(z.literal("")),
  year: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= 0 && v <= 3000), {
      message: "Year must be a valid number"
    }),
  language: z.string().trim().max(64).optional().or(z.literal("")),
  tags: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal(""))
});

