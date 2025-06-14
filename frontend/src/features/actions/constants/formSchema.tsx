import React from "react";
import { z } from "zod";
import {
  Sprout, Tractor, Wind, Droplets, FlaskConical, HelpCircle, PillBottle,
} from "lucide-react";
import { lazyT } from "@/lib/lazyT";

export type ActionType =
  | "planting"
  | "harvesting"
  | "fertilizing"
  | "treatment"
  | "watering"
  | "soil_reading";

export const getActionIcon = (type: ActionType | string) => {
  switch (type) {
    case "planting": return <Sprout size={24} />;
    case "harvesting": return <Tractor size={24} />;
    case "fertilizing": return <Wind size={24} />;
    case "treatment": return <PillBottle size={24} />;
    case "watering": return <Droplets size={24} />;
    case "soil_reading": return <FlaskConical size={24} />;
    default: return <HelpCircle size={24} />;
  }
};

const commonFields = {
  type: z.enum([
    "planting", "harvesting", "fertilizing",
    "treatment", "watering", "soil_reading",
  ]),
  date: z.date().default(() => new Date()),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  comments: z.string().optional(),
};

export const actionFormSchema = z.discriminatedUnion("type", [
  z.object({
    ...commonFields,
    type: z.literal("planting"),
    cropType: z.lazy(() =>
      z.string({
        required_error: lazyT("actionForm.errors.cropTypeRequired")(),
      }).nonempty(lazyT("actionForm.errors.cropTypeRequired")())
    ),
    variety: z.string().optional().nullable(),
    seedingRate: z.string().optional().nullable(),
  }),

  z.object({
    ...commonFields,
    type: z.literal("harvesting"),
    cropYield: z.lazy(() =>
      z.number({
        required_error: lazyT("actionForm.errors.cropYieldRequired")(),
      }).min(0, lazyT("actionForm.errors.minZero")())
    ),
  }),

  z.object({
    ...commonFields,
    type: z.literal("fertilizing"),
    fertilizerType: z.lazy(() =>
      z.string({
        required_error: lazyT("actionForm.errors.fertilizerTypeRequired")(),
      }).nonempty(lazyT("actionForm.errors.fertilizerTypeRequired")())
    ),
    applicationRate: z.lazy(() =>
      z.number({
        required_error: lazyT("actionForm.errors.applicationRateRequired")(),
      }).positive(lazyT("actionForm.errors.positiveNumber")())
    ),
    method: z.string().optional().nullable(),
  }),

  z.object({
    ...commonFields,
    type: z.literal("treatment"),
    pesticideType: z.lazy(() =>
      z.string({
        required_error: lazyT("actionForm.errors.pesticideTypeRequired")(),
      }).nonempty(lazyT("actionForm.errors.pesticideTypeRequired")())
    ),
    targetPest: z.string().optional().nullable(),
    dosage: z.lazy(() =>
      z.number({
        required_error: lazyT("actionForm.errors.dosageRequired")(),
      }).positive(lazyT("actionForm.errors.positiveNumber")())
    ),
    applicationMethod: z.string().optional().nullable(),
  }),

  z.object({
    ...commonFields,
    type: z.literal("watering"),
    waterSource: z.string().optional().nullable(),
    amount: z.lazy(() =>
      z.number({
        required_error: lazyT("actionForm.errors.amountRequired")(),
      }).min(0, lazyT("actionForm.errors.minZero")())
    ),
  }),

  z.object({
    ...commonFields,
    type: z.literal("soil_reading"),
    ph: z.number().min(0).max(14).optional(),
    nitrogen: z.number().min(0).optional(),
    phosphorus: z.number().min(0).optional(),
    potassium: z.number().min(0).optional(),
    organicMatter: z.string().optional().nullable(),
  }),
]);

export type ActionFormValues = z.infer<typeof actionFormSchema>;
