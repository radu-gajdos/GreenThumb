/**
 * SaveMessageModal.tsx
 *
 * A dialog component for saving AI chat messages as permanent field notes,
 * or manually creating a new field note.  
 * Think of it as turning temporary AI advice into your permanent agricultural wisdom book.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookMarked, Plus } from "lucide-react";
import SearchSelect from "@/components/ui/searchSelect";
import FieldNoteApi, { FieldNote } from "../api/fieldNote.api";
import { FieldNoteFormType, fieldNoteFormSchema } from "../constants/formSchema";

interface SaveMessageModalProps {
  /** Controls dialog visibility */
  showModal: boolean;
  /** Setter to toggle dialog */
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  /** The AI message text to be saved (optional for manual creation) */
  messageText?: string;
  /** The plot ID where this message belongs (optional, can be selected in modal) */
  plotId?: string;
  /** Available plots for selection when creating manually */
  availablePlots?: Array<{ id: string; name: string }>;
  /** Optional callback when a field note is successfully saved */
  onSave?: (fieldNote: FieldNote) => void;
  /** Mode: 'save' for saving from chat, 'create' for manual creation */
  mode?: 'save' | 'create';
}

/**
 * SaveMessageModal
 *
 * Presents a form inside a modal to save a field note:
 * - In 'save' mode, pre-fills the message from AI and only title is editable.
 * - In 'create' mode, allows choosing a plot and writing both title and message.
 */
const SaveMessageModal: React.FC<SaveMessageModalProps> = ({
  showModal,
  setShowModal,
  messageText = '',
  plotId = '',
  availablePlots = [],
  onSave,
  mode = 'save',
}) => {
  /** Whether a save request is in progress */
  const [saving, setSaving] = useState(false);
  /** API client for CRUD operations on field notes */
  const fieldNoteApi = useMemo(() => new FieldNoteApi(), []);

  // Initialize form with Zod schema validation
  const form = useForm<FieldNoteFormType>({
    resolver: zodResolver(fieldNoteFormSchema),
    defaultValues: {
      title: "",
      message: messageText,
      plotId: plotId,
    },
  });

  // Reset form fields whenever the modal opens or input props change
  useEffect(() => {
    if (showModal) {
      form.reset({
        title: "",
        message: messageText,
        plotId: plotId,
      });
    }
  }, [showModal, messageText, plotId, form]);

  /** Determine if we are in manual-create mode */
  const isCreateMode = mode === 'create';
  /** Title text for the modal header */
  const modalTitle = isCreateMode
    ? "Creează o notiță nouă"
    : "Salvează mesajul ca notiță";
  /** Description text for the modal header */
  const modalDescription = isCreateMode
    ? "Creează o notiță din capul tău pentru una dintre parcelele tale."
    : "Transformă acest sfat al AI-ului într-o notiță permanentă pentru parcela ta.";
  /** Icon to display in the header */
  const modalIcon = isCreateMode ? <Plus className="w-4" /> : <BookMarked className="w-4" />;

  /**
   * Handle form submission: create a new field note via API,
   * notify parent with onSave callback, and close the modal.
   */
  const onSubmit = async (data: FieldNoteFormType) => {
    setSaving(true);

    try {
      const savedFieldNote = await fieldNoteApi.create({
        title: data.title,
        message: data.message,
        plotId: data.plotId,
      });

      // Notify parent component if callback provided
      onSave?.(savedFieldNote);

      // Close modal on success
      setShowModal(false);
    } catch (error) {
      console.error("Error saving field note:", error);
      // Toast error is already handled in the API service
    } finally {
      setSaving(false);
    }
  };

  /**
   * Generate a suggested title:
   * - In create mode, use current date/time.
   * - In save mode, truncate the message content.
   */
  const generateSuggestedTitle = () => {
    if (isCreateMode) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short',
      });
      const timeStr = now.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
      });

      form.setValue("title", `Notiță - ${dateStr} ${timeStr}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    // In save mode, derive from message content
    const maxLength = 50;
    let suggested = messageText.trim();

    if (suggested.length > maxLength) {
      suggested = suggested.substring(0, maxLength).trim() + "...";
    }

    // Collapse whitespace
    suggested = suggested.replace(/\s+/g, " ");

    form.setValue("title", suggested, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} modal>
      <DialogContent className="sm:max-w-2xl dialog-animation">
        {/* Header with icon, title, and description */}
        <DialogHeader className="flex flex-row items-start space-y-0 pb-2">
          <div className="flex items-start gap-3 flex-col">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
              {modalIcon}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {modalTitle}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {modalDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form
            id="fieldNoteForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-2"
          >
            {/* Plot selection only in create mode */}
            {isCreateMode && (
              <FormField
                control={form.control}
                name="plotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcela</FormLabel>
                    <FormControl>
                      <SearchSelect
                        options={availablePlots.map((plot) => ({
                          label: plot.name,
                          value: plot.id,
                        }))}
                        placeholder="Selectează parcela"
                        value={field.value}
                        onValueChange={field.onChange}
                        modal={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Title input with suggestion helper */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Titlu</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateSuggestedTitle}
                      className="text-xs h-auto p-1"
                    >
                      {isCreateMode ? "Generează cu data" : "Generează titlu"}
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Introduceți un titlu pentru această notiță"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message content - editable only in create mode */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isCreateMode ? "Conținut notiță" : "Conținut mesaj"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      readOnly={!isCreateMode}
                      className={`min-h-[200px] resize-none ${
                        !isCreateMode ? "bg-gray-50" : ""
                      }`}
                      placeholder={
                        isCreateMode
                          ? "Scrie conținutul notiței..."
                          : "Conținutul mesajului..."
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Footer with Cancel and Save buttons */}
        <DialogFooter className="grid grid-cols-2 gap-2 pt-0 pb-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-sm h-9"
              disabled={saving}
            >
              Anulează
            </Button>
          </DialogClose>
          <Button
            type="submit"
            size="sm"
            className="text-sm h-9"
            form="fieldNoteForm"
            disabled={saving}
          >
            {saving
              ? isCreateMode
                ? "Se creează..."
                : "Se salvează..."
              : isCreateMode
              ? "Creează notița"
              : "Salvează notița"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMessageModal;
