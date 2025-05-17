/**
 * ActionModalForm.tsx
 *
 * Renders a modal dialog to create a new plot action.
 * 1. First prompts the user to select an action type.
 * 2. Then displays the corresponding form (ActionFormContent).
 * On save, calls `onSave` and closes the modal.
 */

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ActionFormContent from "../components/FormContent";
import {
  ActionFormValues,
  ActionType,
  getActionIcon,
} from "../constants/formSchema";

interface ActionModalFormProps {
  /** Whether the modal is open */
  showModal: boolean;
  /** Setter to open/close the modal */
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  /** Callback invoked with form data when saving a new action */
  onSave: (data: ActionFormValues) => void;
}

/**
 * ActionModalForm
 *
 * Controls the flow:
 * - If no action type is selected, show a grid of buttons for each type.
 * - Once a type is chosen, render the <ActionFormContent> for that type.
 */
const ActionModalForm: React.FC<ActionModalFormProps> = ({
  showModal,
  setShowModal,
  onSave,
}) => {
  /** Currently selected action type; null means "choose type" step */
  const [selectedType, setSelectedType] = useState<ActionType | null>(null);

  /**
   * List of all possible action types.
   * Wrapped in useMemo to avoid recreating the array on every render.
   */
  const actionTypes: ActionType[] = useMemo(
    () => [
      "planting",
      "harvesting",
      "fertilizing",
      "treatment",
      "watering",
      "soil_reading",
    ],
    []
  );

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} modal>
      <DialogContent className="sm:max-w-lg z-[1000]">
        {!selectedType ? (
          <>
            {/* Step 1: Action type selection */}
            <DialogHeader>
              <DialogTitle>Select Action Type</DialogTitle>
              <DialogDescription>
                Pick one to create a new action.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 p-4">
              {actionTypes.map((type) => (
                <button
                  key={type}
                  className="flex flex-col items-center justify-center p-4 border rounded hover:bg-gray-50"
                  onClick={() => setSelectedType(type)}
                >
                  {/* Icon for this action */}
                  <span className="text-2xl">{getActionIcon(type)}</span>
                  {/* Human-readable label (replace underscores, capitalize) */}
                  <span className="mt-2 capitalize">
                    {type.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
            <DialogFooter>
              {/* Close without selecting */}
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          /* Step 2: Render the form for the chosen action type */
          <ActionFormContent
            type={selectedType}
            onBack={() => setSelectedType(null)} // Go back to type selector
            onSubmit={(data) => {
              onSave(data);           // Pass data to parent
              setSelectedType(null);  // Reset to initial step
              setShowModal(false);    // Close modal
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActionModalForm;
