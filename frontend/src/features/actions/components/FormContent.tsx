/**
 * ActionFormContent.tsx
 *
 * Renders a dynamic form for creating various plot actions (planting, harvesting, etc.).
 * Uses React Hook Form with Zod schema validation, and conditionally shows extra fields
 * based on the selected `type`.
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

interface ActionFormContentProps {
  /** The type of action being created (controls which extra fields appear) */
  type: ActionType;
  /** Called when the form is successfully submitted */
  onSubmit: (data: ActionFormValues) => void;
  /** Called when the user clicks the "Back" button */
  onBack: () => void;
}

/**
 * ActionFormContent
 *
 * A form component that:
 *  - Initializes RHF with a Zod schema
 *  - Always shows date, operator, notes fields
 *  - Conditionally shows extra inputs based on `type`
 *  - Provides "Cancel" and "Save" actions
 */
const ActionFormContent: React.FC<ActionFormContentProps> = ({
  type,
  onSubmit,
  onBack,
}) => {
  // Initialize the form, defaulting the date/operator/notes to empty
  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      type,
      date: "",
      operator: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Header with back button, title, and icon */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft />
          </Button>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getActionIcon(type)} Create {type}
          </h3>
          {/* Empty placeholder to balance flex */}
          <div />
        </div>

        {/* Common fields */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="operator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Operator name" />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type-specific fields */}
        {type === "harvesting" && (
          <FormField
            control={form.control}
            name="yield"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yield (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === "treatment" && (
          <FormField
            control={form.control}
            name="treatmentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === "watering" && (
          <>
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hrs)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume (m³)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === "soil_reading" && (
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reading Method</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Form actions */}
        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size="sm">
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ActionFormContent;
