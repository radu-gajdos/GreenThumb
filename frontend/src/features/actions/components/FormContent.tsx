/**
 * ActionFormContent.tsx
 *
 * Renders a form for creating or editing an agricultural action.
 * - Uses React Hook Form with Zod for validation
 * - Initializes default values based on `type` or `initialData`
 * - Conditionally shows fields relevant to the chosen action type
 * - Provides Back, Cancel, and Save controls
 */

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  actionFormSchema,
  ActionFormValues,
  getActionIcon,
  ActionType,
} from "../constants/formSchema";
import DatePicker from "@/components/ui/date-picker";

interface ActionFormContentProps {
  /** Determines which extra fields are rendered */
  type: ActionType;
  /** Called with validated form values on submit */
  onSubmit: (data: ActionFormValues) => void;
  /** Called when the Back button is clicked */
  onBack: () => void;
  /** If provided, pre-fills the form (edit mode) */
  initialData?: ActionFormValues | null;
}

/**
 * ActionFormContent
 *
 * Main form component for an action. Sets up RHF + Zod and conditionally
 * renders fields based on `type`. Wraps inputs in our shared UI components.
 */
const ActionFormContent: React.FC<ActionFormContentProps> = ({
  type,
  onSubmit,
  onBack,
  initialData = null,
}) => {
  // Initialize form, seeding defaultValues from `initialData` if editing,
  // otherwise setting sensible defaults per action type.
  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues:
      initialData || ({
        type,
        comments: "",
        // Planting defaults
        ...(type === "planting" && {
          cropType: "",
          variety: "",
          seedingRate: "",
          plantingDate: "",
        }),
        // Harvesting defaults
        ...(type === "harvesting" && {
          cropYield: 0,
          harvestDate: "",
        }),
        // Fertilizing defaults
        ...(type === "fertilizing" && {
          fertilizerType: "",
          applicationRate: 0,
          method: "",
        }),
        // Treatment defaults
        ...(type === "treatment" && {
          pesticideType: "",
          targetPest: "",
          dosage: 0,
          applicationMethod: "",
        }),
        // Watering defaults
        ...(type === "watering" && {
          waterSource: "",
          amount: 0,
        }),
        // Soil reading defaults
        ...(type === "soil_reading" && {
          ph: 7,
          nitrogen: 0,
          phosphorus: 0,
          potassium: 0,
          organicMatter: "",
        }),
      } as ActionFormValues),
  });

  /**
   * Returns the appropriate icon color class for each action type.
   */
  const getIconColor = () => {
    switch (type) {
      case 'planting':
        return 'text-green-600';
      case 'harvesting':
        return 'text-yellow-600';
      case 'fertilizing':
        return 'text-amber-600';
      case 'treatment':
        return 'text-red-600';
      case 'watering':
        return 'text-blue-600';
      case 'soil_reading':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Returns the appropriate text color class for each action type.
   */
  const getTextColor = () => {
    switch (type) {
      case 'planting':
        return 'text-green-700';
      case 'harvesting':
        return 'text-yellow-700';
      case 'fertilizing':
        return 'text-amber-700';
      case 'treatment':
        return 'text-red-700';
      case 'watering':
        return 'text-blue-700';
      case 'soil_reading':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Header with Back button, icon + title */}
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1 flex items-center justify-center">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${getTextColor()}`}>
              <span className={getIconColor()}>
                {React.cloneElement(getActionIcon(type) as React.ReactElement, { size: 22 })}
              </span>
              {type.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
            </h3>
          </div>
          {/* Empty div to balance the back button */}
          <div className="w-10" />
        </div>

        {/* Common field: comments */}
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional comments" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Contract</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Planting fields --- */}
        {type === "planting" && (
          <>
            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Wheat" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variety"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variety</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Durum" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seedingRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seeding Rate</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="kg/ha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- Harvesting fields --- */}
        {type === "harvesting" && (
          <>
            <FormField
              control={form.control}
              name="cropYield"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yield (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- Fertilizing fields --- */}
        {type === "fertilizing" && (
          <>
            <FormField
              control={form.control}
              name="fertilizerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fertilizer Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Urea" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicationRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Rate (kg/ha)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Method</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Broadcast" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- Treatment fields --- */}
        {type === "treatment" && (
          <>
            <FormField
              control={form.control}
              name="pesticideType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesticide Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Glyphosate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetPest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Pest</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Aphids" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage (l/ha)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Method</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Sprayer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- Watering fields --- */}
        {type === "watering" && (
          <>
            <FormField
              control={form.control}
              name="waterSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Source</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Well" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (m³)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- Soil Reading fields --- */}
        {type === "soil_reading" && (
          <>
            <FormField
              control={form.control}
              name="ph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>pH Level (0–14)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={14}
                      step={0.1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nitrogen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nitrogen (mg/kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phosphorus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phosphorus (mg/kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="potassium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potassium (mg/kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organicMatter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organic Matter (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 3.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Form actions */}
        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size="sm" className={type ? `bg-${type === 'planting' ? 'green' : type === 'harvesting' ? 'yellow' : type === 'fertilizing' ? 'amber' : type === 'treatment' ? 'red' : type === 'watering' ? 'blue' : type === 'soil_reading' ? 'purple' : 'primary'}-600 hover:bg-${type === 'planting' ? 'green' : type === 'harvesting' ? 'yellow' : type === 'fertilizing' ? 'amber' : type === 'treatment' ? 'red' : type === 'watering' ? 'blue' : type === 'soil_reading' ? 'purple' : 'primary'}-700` : ''}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ActionFormContent;