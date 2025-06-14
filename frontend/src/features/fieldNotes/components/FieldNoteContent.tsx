import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Calendar, Clock, Edit3, Trash2, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  selectedNote: SelectedFieldNote;
  onUpdate?: (updatedNote: any) => void;
  onDelete?: (deletedNoteId: string) => void;
}

const FieldNoteContent: React.FC<FieldNoteContentProps> = ({
  selectedNote,
  onUpdate,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { fieldNote, plotName } = selectedNote;
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fieldNoteApi = useMemo(() => new FieldNoteApi(), []);

  const form = useForm<FieldNoteFormType>({
    resolver: zodResolver(fieldNoteFormSchema),
    defaultValues: {
      title: fieldNote.title,
      message: fieldNote.message,
      plotId: fieldNote.plotId,
    },
  });

  useEffect(() => {
    form.reset({
      title: fieldNote.title,
      message: fieldNote.message,
      plotId: fieldNote.plotId,
    });
    setIsEditing(false);
  }, [fieldNote, form]);

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    form.reset({
      title: fieldNote.title,
      message: fieldNote.message,
      plotId: fieldNote.plotId,
    });
    setIsEditing(false);
  };

  const handleSave = async (data: FieldNoteFormType) => {
    setSaving(true);
    const updateData: UpdateFieldNoteDto = {
      id: fieldNote.id,
      title: data.title,
      message: data.message,
    };
    try {
      const updatedNote = await fieldNoteApi.update(updateData);
      if (onUpdate) onUpdate(updatedNote);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating field note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fieldNoteApi.delete(fieldNote.id);
      if (onDelete) onDelete(fieldNote.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting field note:", error);
    }
  };

  const formatDetailedDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const wasUpdated = () => {
    const created = new Date(fieldNote.createdAt).getTime();
    const updated = new Date(fieldNote.updatedAt).getTime();
    return updated - created > 1000;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
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
                            placeholder={t("fieldNoteContent.editTitlePlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            ) : (
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {fieldNote.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{plotName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDetailedDate(fieldNote.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(fieldNote.createdAt)}</span>
              </div>
              {wasUpdated() && (
                <div className="flex items-center gap-1 text-amber-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{t("fieldNoteContent.modifiedBadge")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} disabled={saving}>
                  <X className="w-4 h-4 mr-1" />
                  {t("fieldNoteContent.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={saving} onClick={form.handleSubmit(handleSave)}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? t("fieldNoteContent.saving") : t("fieldNoteContent.save")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  {t("fieldNoteContent.edit")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t("fieldNoteContent.delete")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {isEditing ? (
              <div className="space-y-4">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fieldNoteContent.noteContentLabel")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[200px] resize-none"
                            placeholder={t("fieldNoteContent.noteContentPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
            ) : (
              <div className="prose prose-gray max-w-none">
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-300">
                  <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                    {fieldNote.message}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                {wasUpdated() && (
                  <div>
                    <span className="font-medium">{t("fieldNoteContent.lastModified")}</span>{" "}
                    {formatDetailedDate(fieldNote.updatedAt)} {t("fieldNoteContent.at")}{" "}
                    {formatTime(fieldNote.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText={t("fieldNoteContent.deleteConfirm", { title: fieldNote.title })}
      />
    </div>
  );
};

export default FieldNoteContent;