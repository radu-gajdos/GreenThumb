import React, { useEffect, useMemo, useState } from "react";
import { PlotApi } from "../api/plot.api";
import { PlotFormType } from "../constants/formSchema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plot } from "../interfaces/plot";
import ModalSkeleton from "@/components/modals/ModalSkeleton";
import FormContent from "../components/FormContent";
import { PencilLine, Map } from "lucide-react";
import { ToastService } from "@/services/toast.service";

interface ModalFormProps {
  /** Controls dialog visibility */
  showModal: boolean;
  /** Setter to toggle dialog */
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  /** Callback when a plot is saved (create or update) */
  onSave: (item: Plot) => void;
  /** If non-null, dialog is in "edit" mode for this plot ID */
  uid: string | null;
}

/**
 * ModalForm
 *
 * Renders a dialog with a form for creating or editing a Plot.
 * - In "edit" mode (uid provided), loads existing Plot data on open.
 * - On submit, calls create or update and notifies parent.
 */
const ModalForm: React.FC<ModalFormProps> = ({
  showModal,
  setShowModal,
  onSave,
  uid,
}) => {
  // Loading state for initial data fetch
  const [loading, setLoading] = useState(false);
  // Holds the Plot data when editing; null when creating
  const [initialData, setInitialData] = useState<Plot | null>(null);
  // Memoized API client instance
  const plotApi = useMemo(() => new PlotApi(), []);

  /**
   * Effect: whenever the modal opens in edit mode, fetch the plot data.
   * If creating (uid === null), clear initialData.
   */
  useEffect(() => {
    if (showModal && uid !== null) {
      setLoading(true);
      plotApi
        .findOne(uid)
        .then((data) => {
          setInitialData(data);
        })
        .catch((err) => {
          // API shows its own toast on error; here we could log or handle further
          console.error("Failed to load plot for editing:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset form when modal closes or switching to create mode
      setInitialData(null);
    }
  }, [showModal, uid, plotApi]);

  /**
   * Form submission handler.
   * Decides between create or update based on presence of uid.
   */
  const onSubmit = async (data: PlotFormType) => {
    // If uid exists, update; otherwise, create new
    const action = uid !== null ? plotApi.update(data) : plotApi.create(data);

    action
      .then((saved) => {
        onSave(saved); // Notify parent to refresh list/local state
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error saving plot:", error);
      });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} modal>
      <DialogContent className="sm:max-w-6xl dialog-animation">
        <DialogHeader className="flex flex-row items-start space-y-0 pb-2">
          {/* Icon changes depending on create vs edit */}
          <div className="flex items-start gap-3 flex-col">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
              {uid ? <PencilLine className="w-4" /> : <Map className="w-4" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {uid ? "Actualizează parcela" : "Creează o parcelă nouă"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Completează formularul și apasă pe butonul de{" "}
                {uid ? "actualizare" : "creare"}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          {/* Show skeleton loader while fetching initial data */}
          {loading ? (
            <ModalSkeleton rows={2} columns={2} />
          ) : (
            <FormContent
              onSubmit={onSubmit}
              formId="plotForm"
              initialData={initialData}
            />
          )}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2 pt-0 pb-2">
          {/* Close button */}
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-sm h-9"
            >
              Închide
            </Button>
          </DialogClose>
          {/* Submit button tied to FormContent via form="plotForm" */}
          <Button
            type="submit"
            size="sm"
            className="text-sm h-9"
            form="plotForm"
          >
            {uid ? "Actualizează parcela" : "Creează parcela"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalForm;
