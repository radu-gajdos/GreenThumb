import { z } from "zod";
import { lazyT } from "@/lib/lazyT";

export const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, lazyT("plotFormSchema.errors.nameRequired")()),
  size: z.number().min(0.01, lazyT("plotFormSchema.errors.sizeTooSmall")()),
  boundary: z.any({ required_error: lazyT("plotFormSchema.errors.boundaryRequired")() }),
  topography: z.string().nullable().optional(),
  soilType: z.string().nullable().optional(),
});

export type PlotFormType = z.infer<typeof formSchema>;
