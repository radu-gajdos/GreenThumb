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
  date: z.string({ required_error: "Date is required" }).nonempty(),
  operator: z.string({ required_error: "Operator is required" }).nonempty(),
  notes: z.string().optional(),
};

export const actionFormSchema = z.discriminatedUnion("type", [
  z.object({
    ...commonFields,
    type: z.literal("planting"),
  }),
  z.object({
    ...commonFields,
    type: z.literal("harvesting"),
    yield: z.number({ required_error: "Yield is required" }),
  }),
  z.object({
    ...commonFields,
    type: z.literal("fertilizing"),
    method: z.string({ required_error: "Method is required" }).nonempty(),
    quantity: z.number({ required_error: "Quantity is required" }),
  }),
  z.object({
    ...commonFields,
    type: z.literal("treatment"),
    treatmentName: z.string({ required_error: "Treatment name is required" }).nonempty(),
  }),
  z.object({
    ...commonFields,
    type: z.literal("watering"),
    duration: z.number({ required_error: "Duration is required" }),
    volume: z.number({ required_error: "Volume is required" }),
  }),
  z.object({
    ...commonFields,
    type: z.literal("soil_reading"),
    method: z.string({ required_error: "Reading method is required" }).nonempty(),
  }),
]);

export type ActionFormValues = z.infer<typeof actionFormSchema>;
