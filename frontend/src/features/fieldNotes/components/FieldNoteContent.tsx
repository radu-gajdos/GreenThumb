/**
 * FieldNoteContent.tsx
 *
 * Displays and allows editing/deleting of a selected field note.
 * - Shows title, metadata (plot name, creation date/time, last updated)
 * - Toggles between “view” and “edit” modes
 * - Handles save (update) and delete actions via FieldNoteApi
 * - Calls parent callbacks (`onUpdate`, `onDelete`) on success
 */

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Calendar, Clock, Edit3, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ModalDelete from "@/components/modals/ModalDelete";
import FieldNoteApi, { UpdateFieldNoteDto } from "../api/fieldNote.api";
import { FieldNoteFormType, fieldNoteFormSchema } from "../constants/formSchema";
import { SelectedFieldNote } from "../interfaces/fieldNote";

interface FieldNoteContentProps {
  /** The currently selected note and its associated plot name */
  selectedNote: SelectedFieldNote;
  /** Optional callback when a note is updated */
  onUpdate?: (updatedNote: any) => void;
  /** Optional callback when a note is deleted */
  onDelete?: (deletedNoteId: string) => void;
}

/**
 * FieldNoteContent
 *
 * Renders the content of a field note, including:
 *  - Title (editable)
 *  - Plot name with location icon
 *  - Creation date/time with icons
 *  - “Modified” badge if updatedAt > createdAt + 1s
 *  - Full message content (editable textarea)
 *  - Action buttons: Edit, Save, Cancel, Delete
 *  - Delete confirmation modal
 */
const FieldNoteContent: React.FC<FieldNoteContentProps> = ({
  selectedNote,
  onUpdate,
  onDelete,
}) => {
  const { fieldNote, plotName } = selectedNote;

  /** Whether the note is currently in “edit” mode */
  const [isEditing, setIsEditing] = useState(false);
  /** Controls visibility of the delete confirmation modal */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  /** Whether an update request is in progress */
  const [saving, setSaving] = useState(false);

  /** Instantiate API client once */
  const fieldNoteApi = useMemo(() => new FieldNoteApi(), []);

  /** 
   * React Hook Form setup for editing:
   * - Uses Zod schema for validation
   * - Default values loaded from the selected note
   */
  const form = useForm<FieldNoteFormType>({
    resolver: zodResolver(fieldNoteFormSchema),
    defaultValues: {
      title: fieldNote.title,
      message: fieldNote.message,
      plotId: fieldNote.plotId,
    },
  });

  /**
   * Whenever a new note is selected (or its data changes), 
   * reset the form fields and exit edit mode.
   */
  useEffect(() => {
    form.reset({
      title: fieldNote.title,
      message: fieldNote.message,
      plotId: fieldNote.plotId,
    });
    setIsEditing(false);
  }, [fieldNote, form]);

  /** Enter edit mode */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /** Cancel edit: discard changes and reset form */
  const handleCancelEdit = () => {
    form.reset({
      title: fieldNote.title,
      message: fieldNote.message,
      plotId: fieldNote.plotId,
    });
    setIsEditing(false);
  };

  /**
   * Save changes to the note:
   * 1. Build UpdateFieldNoteDto (id, title, message)
   * 2. Call API to update
   * 3. Notify parent via `onUpdate`
   * 4. Exit edit mode
   */
  const handleSave = async (data: FieldNoteFormType) => {
    setSaving(true);

    const updateData: UpdateFieldNoteDto = {
      id: fieldNote.id,
      title: data.title,
      message: data.message,
    };

    // Debug log (remove or guard in production)
    console.log("Saving field note update:", updateData);

    try {
      const updatedNote = await fieldNoteApi.update(updateData);
      console.log("Field note updated successfully:", updatedNote);

      if (onUpdate) {
        onUpdate(updatedNote);
      } else {
        console.warn("onUpdate callback not provided");
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating field note:", error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Confirm and delete the current note:
   * 1. Call API to delete
   * 2. Notify parent via `onDelete`
   * 3. Close delete modal
   */
  const handleDelete = async () => {
    // Debug log 
    console.log("Deleting field note:", fieldNote.id);

    try {
      await fieldNoteApi.delete(fieldNote.id);
      console.log("Field note deleted successfully");

      if (onDelete) {
        onDelete(fieldNote.id);
      } else {
        console.warn("onDelete callback not provided");
      }

      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting field note:", error);
    }
  };

  /**
   * Format a Date or ISO string to a detailed Romanian date:
   * e.g. “marți, 5 august 2025”
   */
  const formatDetailedDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Format a Date or ISO string to Romanian time (HH:mm):
   * e.g. “14:35”
   */
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Determine if the note was modified after creation:
   * Returns true if updatedAt is more than 1 second after createdAt
   */
  const wasUpdated = () => {
    const created = new Date(fieldNote.createdAt).getTime();
    const updated = new Date(fieldNote.updatedAt).getTime();
    return updated - created > 1000;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header: Title (or editable input) + Metadata + Action buttons */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              // Editing title: render input field
              <div className="border-b border-gray-200 p-6 flex-shrink-0">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            className="text-2xl font-semibold border-none p-0 focus:ring-0 focus:border-none"
                            placeholder="Titlul notiței..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            ) : (
              // Viewing title: render <h1>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {fieldNote.title}
              </h1>
            )}

            {/* Metadata: plot name, created date, created time, modified badge */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {/* Plot Name */}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{plotName}</span>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDetailedDate(fieldNote.createdAt)}</span>
              </div>

              {/* Created Time */}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(fieldNote.createdAt)}</span>
              </div>

              {/* “Modified” badge if was updated */}
              {wasUpdated() && (
                <div className="flex items-center gap-1 text-amber-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Modificat</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Edit / Delete or Save / Cancel */}
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                {/* Cancel editing */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Anulează
                </Button>
                {/* Save changes */}
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  onClick={form.handleSubmit(handleSave)}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? "Se salvează..." : "Salvează"}
                </Button>
              </>
            ) : (
              <>
                {/* Enter edit mode */}
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editează
                </Button>
                {/* Open delete confirmation */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Șterge
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Message body (editable textarea or read-only) */}
      <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
            {isEditing ? (
              // Editing message: render textarea
              <div className="space-y-4">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conținut notiță</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[200px] resize-none"
                            placeholder="Scrie conținutul notiței..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            ) : (
              // Viewing message: render styled block
              <div className="prose prose-gray max-w-none">
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-300">
                  <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                    {fieldNote.message}
                  </div>
                </div>
              </div>
            )}

            {/* Footer info: show last modified timestamp if applicable */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                {wasUpdated() && (
                  <div>
                    <span className="font-medium">Ultima modificare:</span>{" "}
                    {formatDetailedDate(fieldNote.updatedAt)} la{" "}
                    {formatTime(fieldNote.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText={`Ești sigur că dorești să ștergi notița "${fieldNote.title}"? Această acțiune nu poate fi anulată.`}
      />
    </div>
  );
};

export default FieldNoteContent;
