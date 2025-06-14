import { z } from "zod";

/**
 * Validation schema for saving chat messages as field notes
 */
export const fieldNoteFormSchema = z.object({
    title: z
        .string()
        .min(1, "Titlul este obligatoriu.")
        .max(100, "Titlul nu poate avea mai mult de 100 de caractere."),
    message: z
        .string()
        .min(1, "Mesajul este obligatoriu."),
    plotId: z
        .string()
        .min(1, "ID-ul parcelei este obligatoriu."),
});

export type FieldNoteFormType = z.infer<typeof fieldNoteFormSchema>;