/**
 * ActionModalForm.tsx
 *
 * Renders a modal dialog for creating or editing an Action:
 * 1. If `uid` is null, first prompts for action type selection.
 * 2. If editing (`uid` provided), loads initial data and skips type selection.
 * 3. Renders the form (`ActionFormContent`) once a type is known.
 * 4. Handles create/update via ActionApi, shows toasts, and invokes `onSave`.
 */

import React, { useEffect, useMemo, useState } from "react";
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
import { ActionApi } from "../api/action.api";
import { ToastService } from "@/services/toast.service";
import { Action } from "../interfaces/action";

interface ActionModalFormProps {
  /** Whether the dialog is open */
  showModal: boolean;
  /** Setter to open/close the dialog */
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  /** Called after successful create/update, receives the saved Action */
  onSave: (data: Action) => void;
  /** If provided, loads this Action for editing */
  uid?: string | null;
  /** ID of the parent Plot to which this Action belongs */
  plotId: string;
}

const ActionModalForm: React.FC<ActionModalFormProps> = ({
  showModal,
  setShowModal,
  onSave,
  uid = null,
  plotId,
}) => {
  /** Selected action type (e.g. 'planting'); determines which form to show */
  const [selectedType, setSelectedType] = useState<ActionType | null>(null);
  /** Data loaded from API when editing */
  const [initialData, setInitialData] = useState<ActionFormValues | null>(null);
  /** Loading indicator for fetch/edit load */
  const [loading, setLoading] = useState(false);
  /** Memoized API client */
  const actionApi = useMemo(() => new ActionApi(), []);

  /**
   * When the modal opens in edit mode (uid provided), fetch existing action.
   * Otherwise, reset to create mode.
   */
  useEffect(() => {
    if (showModal && uid) {
      setLoading(true);
      actionApi
        .findOne(uid)
        .then((data) => {
          // Pre-fill form and skip type-selection step
          setInitialData(data as ActionFormValues);
          setSelectedType(data.type as ActionType);
        })
        .catch((e) => {
          ToastService.error("Eroare la încărcarea acțiunii.");
          console.error("Fetch action failed:", e);
        })
        .finally(() => setLoading(false));
    } else {
      // Reset form state when closing or switching to create mode
      setInitialData(null);
      setSelectedType(null);
    }
  }, [showModal, uid, actionApi]);

  /**
   * Called when form is submitted.
   * Performs create or update, shows a toast, and notifies parent.
   */
  const handleSubmit = async (formData: ActionFormValues) => {
    try {
      const response = uid
        ? await actionApi.update(formData, plotId)
        : await actionApi.create(formData, plotId);

      ToastService.success(
        uid ? "Acțiunea a fost actualizată." : "Acțiunea a fost creată."
      );
      onSave(response);
      setShowModal(false);
    } catch (err) {
      console.error("Save action error:", err);
      ToastService.error("Eroare la salvarea acțiunii.");
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} modal>
      <DialogContent className="sm:max-w-lg z-[1000]">
        {/* Step 1: Type selection (only if no type yet) */}
        {!selectedType ? (
          <>
            <DialogHeader>
              <DialogTitle>Selectează tipul de acțiune</DialogTitle>
              <DialogDescription>
                Alege tipul de acțiune pentru a continua.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 p-4">
              {(["planting", "harvesting", "fertilizing", "treatment", "watering", "soil_reading"] as ActionType[]).map(
                (type) => (
                  <button
                    key={type}
                    className="flex flex-col items-center justify-center p-4 border rounded hover:bg-gray-50"
                    onClick={() => setSelectedType(type)}
                  >
                    <span className="text-2xl">{getActionIcon(type)}</span>
                    <span className="mt-2 capitalize">{type.replace("_", " ")}</span>
                  </button>
                )
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Închide
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          /* Step 2: Render the action form */
          <ActionFormContent
            type={selectedType}
            initialData={initialData || undefined}
            onBack={() => setSelectedType(null)}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActionModalForm;
