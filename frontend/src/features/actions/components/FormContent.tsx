/**
 * ActionFormContent.tsx
 *
 * Renders a form for creating or editing an agricultural action.
 * - Uses React Hook Form with Zod for validation
 * - Initializes default values based on `type` or `initialData`
 * - Conditionally shows fields relevant to the chosen action type
 * - Provides Back, Cancel, and Save controls
 * - Only supports the original 6 action types
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
import SearchSelect from "@/components/ui/searchSelect";
import { ArrowLeft } from "lucide-react";
import {
  actionFormSchema,
  ActionFormValues,
  getActionIcon,
  ActionType,
} from "../constants/formSchema";
import DatePicker from "@/components/ui/date-picker";
import DateTimePicker from "@/components/ui/dateTime-picker";

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
  // Status options for SearchSelect
  const statusOptions = [
    { label: 'Planificat', value: 'planned' },
    { label: 'În progres', value: 'in_progress' },
    { label: 'Completat', value: 'completed' },
    { label: 'Anulat', value: 'cancelled' },
  ];

  // Initialize form, seeding defaultValues from `initialData` if editing,
  // otherwise setting sensible defaults per action type.
  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues:
      initialData || ({
        type,
        status: 'planned',
        description: "",
        notes: "",
        comments: "",
        date: new Date(),
        // Type-specific defaults
        ...(type === "planting" && {
          cropType: "",
          variety: "",
          seedingRate: "",
        }),
        ...(type === "harvesting" && {
          cropYield: 0,
        }),
        ...(type === "fertilizing" && {
          fertilizerType: "",
          applicationRate: 0,
          method: "",
        }),
        ...(type === "treatment" && {
          pesticideType: "",
          targetPest: "",
          dosage: 0,
          applicationMethod: "",
        }),
        ...(type === "watering" && {
          waterSource: "",
          amount: 0,
        }),
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

  /**
   * Returns human-readable labels for action types.
   */
  const getActionLabel = (type: ActionType) => {
    switch (type) {
      case 'planting':
        return 'Plantare';
      case 'harvesting':
        return 'Recoltare';
      case 'fertilizing':
        return 'Fertilizare';
      case 'treatment':
        return 'Tratament';
      case 'watering':
        return 'Udare';
      case 'soil_reading':
        return 'Analiză Sol';
      default:
        return (type as string).replace("_", " ").replace(/^\w/, (c: any) => c.toUpperCase());
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
              {getActionLabel(type)}
            </h3>
          </div>
          {/* Empty div to balance the back button */}
          <div className="w-10" />
        </div>

        {/* Common fields */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Planificată</FormLabel>
              <FormControl>
                <DateTimePicker
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <div className="relative z-50">
                  <SearchSelect
                    options={statusOptions}
                    placeholder="Selectează statusul"
                    value={field.value}
                    onValueChange={field.onChange}
                    modal={true}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descriere</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descrierea acțiunii" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notițe</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Notițe suplimentare" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type-specific fields */}
        {type === "planting" && (
          <>
            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Cultură</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Grâu" />
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
                  <FormLabel>Varietate</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Dropia" />
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
                  <FormLabel>Norma de Însămânțare</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="kg/ha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === "harvesting" && (
          <FormField
            control={form.control}
            name="cropYield"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Randament (kg/ha)</FormLabel>
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
        )}

        {type === "fertilizing" && (
          <>
            <FormField
              control={form.control}
              name="fertilizerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Îngrășământ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Uree" />
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
                  <FormLabel>Doză Aplicare (kg/ha)</FormLabel>
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
                  <FormLabel>Metodă Aplicare</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Împrăștiat" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === "treatment" && (
          <>
            <FormField
              control={form.control}
              name="pesticideType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Pesticid</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Glifosat" />
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
                  <FormLabel>Dăunător Țintă</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Afide" />
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
                  <FormLabel>Doză (l/ha)</FormLabel>
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
                  <FormLabel>Metodă Aplicare</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Pulverizare" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === "watering" && (
          <>
            <FormField
              control={form.control}
              name="waterSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sursa de Apă</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Fântână" />
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
                  <FormLabel>Cantitate (m³/ha)</FormLabel>
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

        {type === "soil_reading" && (
          <>
            <FormField
              control={form.control}
              name="ph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel pH (0–14)</FormLabel>
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
                  <FormLabel>Azot (mg/kg)</FormLabel>
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
                  <FormLabel>Fosfor (mg/kg)</FormLabel>
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
                  <FormLabel>Potasiu (mg/kg)</FormLabel>
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
                  <FormLabel>Materie Organică (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: 3.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Form actions */}
        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Anulează
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            size="sm" 
            className={`${getButtonColor(type)} text-white`}
          >
            Salvează
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Helper function for button colors
const getButtonColor = (type: ActionType) => {
  switch (type) {
    case 'planting':
      return 'bg-green-600 hover:bg-green-700';
    case 'harvesting':
      return 'bg-yellow-600 hover:bg-yellow-700';
    case 'fertilizing':
      return 'bg-amber-600 hover:bg-amber-700';
    case 'treatment':
      return 'bg-red-600 hover:bg-red-700';
    case 'watering':
      return 'bg-blue-600 hover:bg-blue-700';
    case 'soil_reading':
      return 'bg-purple-600 hover:bg-purple-700';
    default:
      return 'bg-primary hover:bg-primary/90';
  }
};

export default ActionFormContent;