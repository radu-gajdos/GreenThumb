import { z } from "zod";
import { lazyT } from "@/lib/lazyT";

/**
 * Validation schema for saving chat messages as field notes
 */
export const fieldNoteFormSchema = z.object({
  title: z
    .string()
    .min(1, lazyT("fieldNoteFormSchema.errors.titleRequired")())
    .max(100, lazyT("fieldNoteFormSchema.errors.titleTooLong")()),
  message: z
    .string()
    .min(1, lazyT("fieldNoteFormSchema.errors.messageRequired")()),
  plotId: z
    .string()
    .min(1, lazyT("fieldNoteFormSchema.errors.plotIdRequired")()),
});

export type FieldNoteFormType = z.infer<typeof fieldNoteFormSchema>;
