import { z } from "zod";

export const ExtractRequestSchema = z.object({
  html: z.string().min(1, "HTML content is required and cannot be empty"),
  portalType: z
    .enum(["general", "grades", "schedule", "profile", "attendance"])
    .optional()
    .default("general"),
  additionalInstructions: z.string().optional(),
});

export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;
