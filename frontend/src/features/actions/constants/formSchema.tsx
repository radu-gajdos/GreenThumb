import React from "react";
import { date, z } from "zod";
import { 
  Sprout, 
  Tractor, 
  Wind, 
  Droplets, 
  FlaskConical, 
  HelpCircle, 
  PillBottle
} from "lucide-react";

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
      return <Sprout size={24} />;
    case "harvesting":
      return <Tractor size={24} />;
    case "fertilizing":
      return <Wind size={24} />;
    case "treatment":
      return <PillBottle size={24} />;
    case "watering":
      return <Droplets size={24} />;
    case "soil_reading":
      return <FlaskConical size={24} />;
    default:
      return <HelpCircle size={24} />;
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
  date: z.date().default(() => new Date()),
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
  }),
  
  // Harvesting fields
  z.object({
    ...commonFields,
    type: z.literal("harvesting"),
    cropYield: z.number({ required_error: "Yield is required" }).min(0),
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