import { z } from "zod";

export const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Numele este obligatoriu."),
  size: z.number().min(0.01, "Suprafața trebuie să fie mai mare decât 0."),
  boundary: z.any({ required_error: "Boundary este obligatoriu." }),
  topography: z.string().nullable().optional(),
  soilType: z.string().nullable().optional(),
});

export type PlotFormType = z.infer<typeof formSchema>;
