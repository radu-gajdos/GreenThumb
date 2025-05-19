import { z } from "zod";

export type ActionType =
  | "planting"
  | "harvesting"
  | "fertilizing"
  | "treatment"
  | "watering"
  | "soil_reading";

export const getActionIcon = (type: ActionType) => {
  switch (type) {
    case "planting":
      return "🌱";
    case "harvesting":
      return "🚜";
    case "fertilizing":
      return "💩";
    case "treatment":
      return "🧪";
    case "watering":
      return "💧";
    case "soil_reading":
      return "🧪";
    default:
      return "❓";
  }
};

const commonFields = {
  type: z.enum([
    "planting",
    "harvesting",
    "fertilizing",
    "treatment",
    "watering",
    "soil_reading",
  ]),
  // Unlike original, we won't require operator and date as common fields,
  // since they don't appear in the DTO. We'll handle them differently in the UI.
  comments: z.string().optional(),
};

export const actionFormSchema = z.discriminatedUnion("type", [
  // Planting fields
  z.object({
    ...commonFields,
    type: z.literal("planting"),
    cropType: z.string({ required_error: "Crop type is required" }).nonempty(),
    variety: z.string().optional(),
    seedingRate: z.string().optional(),
    plantingDate: z.string().optional(),
  }),
  
  // Harvesting fields
  z.object({
    ...commonFields,
    type: z.literal("harvesting"),
    cropYield: z.number({ required_error: "Yield is required" }).min(0),
    harvestDate: z.string().optional(),
  }),
  
  // Fertilizing fields
  z.object({
    ...commonFields,
    type: z.literal("fertilizing"),
    fertilizerType: z.string({ required_error: "Fertilizer type is required" }).nonempty(),
    applicationRate: z.number({ required_error: "Application rate is required" }).positive(),
    method: z.string().optional(),
  }),
  
  // Treatment fields
  z.object({
    ...commonFields,
    type: z.literal("treatment"),
    pesticideType: z.string({ required_error: "Pesticide type is required" }).nonempty(),
    targetPest: z.string().optional(),
    dosage: z.number({ required_error: "Dosage is required" }).positive(),
    applicationMethod: z.string().optional(),
  }),
  
  // Watering fields
  z.object({
    ...commonFields,
    type: z.literal("watering"),
    waterSource: z.string().optional(),
    amount: z.number({ required_error: "Amount is required" }).min(0),
  }),
  
  // Soil reading fields
  z.object({
    ...commonFields,
    type: z.literal("soil_reading"),
    ph: z.number().min(0).max(14).optional(),
    nitrogen: z.number().min(0).optional(),
    phosphorus: z.number().min(0).optional(),
    potassium: z.number().min(0).optional(),
    organicMatter: z.string().optional(),
  }),
]);

export type ActionFormValues = z.infer<typeof actionFormSchema>;